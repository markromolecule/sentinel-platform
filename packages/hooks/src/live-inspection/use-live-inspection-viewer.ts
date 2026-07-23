'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Room, RoomEvent, Track } from 'livekit-client';
import type { LiveInspectionStaffStatus, LiveInspectionState } from '@sentinel/shared/schema';
import {
    createLiveInspectionViewerConnection,
    getLiveInspectionStatus,
    startLiveInspection,
    stopLiveInspection,
    type ApiClientType,
} from '@sentinel/services';
import { useApi } from '../api-provider';

const VIEWER_STATUS_POLL_MS = 2_000;
const TERMINAL_STATES = new Set<LiveInspectionState>(['ENDED', 'FAILED', 'EXPIRED']);

export type LiveInspectionViewerState =
    | 'idle'
    | 'requesting'
    | 'waiting_for_student'
    | 'connecting'
    | 'live'
    | 'reconnecting'
    | 'stopping'
    | 'ended'
    | 'failed';

export type LiveInspectionViewerReason =
    | 'NOT_ELIGIBLE'
    | 'PERMISSION_DENIED'
    | 'CAPACITY_REACHED'
    | 'CONFLICT'
    | 'OFFLINE'
    | 'TIMEOUT'
    | 'STUDENT_UNAVAILABLE'
    | 'UNEXPECTED_TRACK'
    | 'CONNECT_FAILED'
    | 'STOPPED'
    | null;

export type UseLiveInspectionViewerArgs = {
    examId: string;
    studentId: string;
    attemptId: string | null | undefined;
    enabled: boolean;
    apiClient?: ApiClientType;
};

function mapErrorReason(error: unknown): LiveInspectionViewerReason {
    const message = error instanceof Error ? error.message : String(error ?? '');

    if (/429|capacity/i.test(message)) return 'CAPACITY_REACHED';
    if (/409|already|active|conflict/i.test(message)) return 'CONFLICT';
    if (/401|403|permission|denied|forbidden/i.test(message)) return 'PERMISSION_DENIED';
    if (/network|fetch|offline/i.test(message)) return 'OFFLINE';
    if (/timeout/i.test(message)) return 'TIMEOUT';

    return 'STUDENT_UNAVAILABLE';
}

function isExpectedRemoteCameraTrack(track: any, publication: any) {
    const source = publication?.source ?? track?.source;
    const kind = track?.kind ?? publication?.kind;

    return (
        kind !== 'audio' &&
        source !== Track.Source.ScreenShare &&
        source !== Track.Source.ScreenShareAudio &&
        (source === Track.Source.Camera || kind === 'video')
    );
}

/**
 * Owns the staff/admin LiveKit viewer lifecycle without exposing room tokens.
 */
export function useLiveInspectionViewer({
    examId,
    studentId,
    attemptId,
    enabled,
    apiClient: providedApiClient,
}: UseLiveInspectionViewerArgs) {
    const contextApiClient = useApi();
    const apiClient = providedApiClient ?? contextApiClient;
    const videoElementRef = useRef<HTMLVideoElement | null>(null);
    const roomRef = useRef<Room | null>(null);
    const leaseRef = useRef<LiveInspectionStaffStatus | null>(null);
    const attachedTrackRef = useRef<any>(null);
    const pollTimerRef = useRef<number | null>(null);
    const pollStartTimeRef = useRef<number | null>(null);
    const stopRequestedRef = useRef(false);
    const [state, setState] = useState<LiveInspectionViewerState>('idle');
    const [reason, setReason] = useState<LiveInspectionViewerReason>(null);
    const [connectionQuality, setConnectionQuality] = useState<string | null>(null);

    const clearPollTimer = useCallback(() => {
        if (pollTimerRef.current !== null) {
            window.clearTimeout(pollTimerRef.current);
            pollTimerRef.current = null;
        }
    }, []);

    const detachLocalVideo = useCallback(() => {
        const track = attachedTrackRef.current;
        const videoElement = videoElementRef.current;
        attachedTrackRef.current = null;

        if (!track || !videoElement) {
            return;
        }

        try {
            track.detach(videoElement);
        } catch {
            // Best-effort local cleanup only.
        }
    }, []);

    const cleanupRoom = useCallback(() => {
        clearPollTimer();
        detachLocalVideo();
        roomRef.current?.disconnect();
        roomRef.current = null;
        connectionQuality && setConnectionQuality(null);
    }, [clearPollTimer, connectionQuality, detachLocalVideo]);

    const markVideoPlayable = useCallback(() => {
        setState((current) =>
            current === 'connecting' || current === 'reconnecting' ? 'live' : current,
        );
        setReason(null);
    }, []);

    const setVideoRef = useCallback(
        (element: HTMLVideoElement | null) => {
            const current = videoElementRef.current;
            if (current) {
                current.removeEventListener('playing', markVideoPlayable);
                current.removeEventListener('canplay', markVideoPlayable);
            }

            videoElementRef.current = element;

            if (element) {
                element.addEventListener('playing', markVideoPlayable);
                element.addEventListener('canplay', markVideoPlayable);
            }
        },
        [markVideoPlayable],
    );

    const connectViewer = useCallback(
        async (lease: LiveInspectionStaffStatus) => {
            setState('connecting');
            setReason(null);

            try {
                const credentials = await createLiveInspectionViewerConnection(apiClient, {
                    examId,
                    leaseId: lease.leaseId,
                });
                const room = new Room({ adaptiveStream: true });
                roomRef.current = room;

                room.on(RoomEvent.TrackSubscribed, (track: any, publication: any) => {
                    if (
                        !isExpectedRemoteCameraTrack(track, publication) ||
                        attachedTrackRef.current
                    ) {
                        setReason('UNEXPECTED_TRACK');
                        return;
                    }

                    const videoElement = videoElementRef.current;
                    if (!videoElement) {
                        setReason('UNEXPECTED_TRACK');
                        return;
                    }

                    attachedTrackRef.current = track;
                    track.attach(videoElement);
                });
                room.on(RoomEvent.Reconnecting, () => setState('reconnecting'));
                room.on(RoomEvent.Reconnected, () =>
                    setState((current) => (current === 'reconnecting' ? 'connecting' : current)),
                );
                room.on(RoomEvent.ConnectionQualityChanged, (quality: unknown) => {
                    setConnectionQuality(String(quality));
                });

                await room.connect(credentials.liveKitUrl, credentials.token, {
                    autoSubscribe: true,
                });
            } catch (error) {
                cleanupRoom();
                setState('failed');
                setReason(mapErrorReason(error) ?? 'CONNECT_FAILED');
            }
        },
        [apiClient, cleanupRoom, examId],
    );

    const pollUntilPublisherReady = useCallback(
        async (leaseId: string) => {
            clearPollTimer();

            if (stopRequestedRef.current) {
                return;
            }

            if (pollStartTimeRef.current && Date.now() - pollStartTimeRef.current > 15_000) {
                cleanupRoom();
                setState('failed');
                setReason('TIMEOUT');
                return;
            }

            try {
                const status = await getLiveInspectionStatus(apiClient, { examId, leaseId });
                leaseRef.current = status;

                if (status.state === 'PUBLISHER_READY') {
                    await connectViewer(status);
                    return;
                }

                if (TERMINAL_STATES.has(status.state)) {
                    cleanupRoom();
                    setState(status.state === 'FAILED' ? 'failed' : 'ended');
                    setReason(status.state === 'FAILED' ? 'STUDENT_UNAVAILABLE' : 'STOPPED');
                    return;
                }

                setState('waiting_for_student');
                pollTimerRef.current = window.setTimeout(
                    () => void pollUntilPublisherReady(leaseId),
                    VIEWER_STATUS_POLL_MS,
                );
            } catch (error) {
                setState('failed');
                setReason(mapErrorReason(error));
            }
        },
        [apiClient, cleanupRoom, clearPollTimer, connectViewer, examId],
    );

    const start = useCallback(async () => {
        if (!enabled || !attemptId) {
            setReason('NOT_ELIGIBLE');
            return;
        }

        stopRequestedRef.current = false;
        cleanupRoom();
        setState('requesting');
        setReason(null);

        try {
            const lease = await startLiveInspection(apiClient, { examId, attemptId });
            leaseRef.current = lease;
            setState('waiting_for_student');
            pollStartTimeRef.current = Date.now();
            await pollUntilPublisherReady(lease.leaseId);
        } catch (error) {
            setState('failed');
            setReason(mapErrorReason(error));
        }
    }, [apiClient, attemptId, cleanupRoom, enabled, examId, pollUntilPublisherReady]);

    const stop = useCallback(async () => {
        stopRequestedRef.current = true;
        clearPollTimer();
        setState((current) => (current === 'idle' ? current : 'stopping'));

        const lease = leaseRef.current;
        cleanupRoom();

        if (lease) {
            try {
                await stopLiveInspection(apiClient, { examId, leaseId: lease.leaseId });
            } catch {
                // Server expiry/reconciler remains authoritative; local cleanup still completes.
            }
        }

        leaseRef.current = null;
        setState('ended');
        setReason('STOPPED');
    }, [apiClient, cleanupRoom, clearPollTimer, examId]);

    const retry = useCallback(() => {
        void start();
    }, [start]);

    useEffect(() => {
        if (!enabled) {
            stopRequestedRef.current = true;
            cleanupRoom();
            setState('idle');
            setReason('NOT_ELIGIBLE');
        }
    }, [cleanupRoom, enabled]);

    useEffect(() => {
        return () => {
            stopRequestedRef.current = true;
            const lease = leaseRef.current;
            cleanupRoom();
            if (lease) {
                void stopLiveInspection(apiClient, { examId, leaseId: lease.leaseId });
            }
        };
    }, [apiClient, cleanupRoom, examId]);

    return {
        state,
        reason,
        connectionQuality,
        isLive: state === 'live',
        disabledExplanation: enabled
            ? null
            : 'Live camera viewing is unavailable for this attempt.',
        studentId,
        start,
        stop,
        retry,
        setVideoRef,
    };
}
