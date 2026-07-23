'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Room, Track } from 'livekit-client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { LiveInspectionDirective, LiveInspectionState } from '@sentinel/shared/schema';
import {
    acknowledgeLiveInspectionPublisherFailure,
    acknowledgeLiveInspectionPublisherReady,
    createLiveInspectionPublisherConnection,
    getStudentLiveInspectionDirective,
    type ApiClientType,
} from '@sentinel/services';
import type { SentinelSupabaseClient } from '../auth-provider';
import {
    cloneCameraTrackForLiveInspection,
    stopClonedInspectionTrack,
} from './live-inspection-room.utils';

const LIVE_INSPECTION_SIGNAL_EVENT = 'LIVE_INSPECTION_CHANGED';
const RECONCILE_INTERVAL_MS = 10_000;
const TERMINAL_STATES = new Set<LiveInspectionState>(['ENDED', 'FAILED', 'EXPIRED']);

export type StudentLiveInspectionPublisherStatus =
    'idle' | 'requested' | 'connecting' | 'live' | 'failed';

export type StudentLiveInspectionPublisherFailureCode =
    | 'NO_LIVE_CAMERA_TRACK'
    | 'LIVEKIT_CONNECT_FAILED'
    | 'LIVEKIT_PUBLISH_FAILED'
    | 'LIVEKIT_RUNTIME_LOST';

export type UseStudentLiveInspectionPublisherArgs = {
    supabase: SentinelSupabaseClient | null;
    apiClient: ApiClientType;
    sessionId: string | null | undefined;
    attemptId: string | null | undefined;
    enabled: boolean;
    getLiveVideoTrack: () => MediaStreamTrack | null;
    onStatusChange?: (status: StudentLiveInspectionPublisherStatus) => void;
    onFailure?: (code: StudentLiveInspectionPublisherFailureCode) => void;
};

type ActivePublication = {
    leaseId: string;
    revision: number;
    room: Room;
    clonedTrack: MediaStreamTrack;
};

function isNewerDirective(
    directive: LiveInspectionDirective,
    currentLeaseId: string | null,
    currentRevision: number,
) {
    return (
        directive.leaseId !== currentLeaseId ||
        directive.revision >= currentRevision ||
        TERMINAL_STATES.has(directive.state)
    );
}

/**
 * Publishes the student's existing MediaPipe camera track to LiveKit only after
 * a private realtime hint is confirmed by Sentinel's authoritative directive API.
 */
export function useStudentLiveInspectionPublisher({
    supabase,
    apiClient,
    sessionId,
    attemptId,
    enabled,
    getLiveVideoTrack,
    onStatusChange,
    onFailure,
}: UseStudentLiveInspectionPublisherArgs) {
    const [status, setStatus] = useState<StudentLiveInspectionPublisherStatus>('idle');
    const [activeLeaseId, setActiveLeaseId] = useState<string | null>(null);
    const activePublicationRef = useRef<ActivePublication | null>(null);
    const currentLeaseIdRef = useRef<string | null>(null);
    const currentRevisionRef = useRef(0);
    const requestSequenceRef = useRef(0);
    const isMountedRef = useRef(false);

    const setPublisherStatus = useCallback(
        (nextStatus: StudentLiveInspectionPublisherStatus) => {
            setStatus(nextStatus);
            onStatusChange?.(nextStatus);
        },
        [onStatusChange],
    );

    const cleanupPublication = useCallback(() => {
        const publication = activePublicationRef.current;
        if (!publication) {
            return;
        }

        activePublicationRef.current = null;
        try {
            publication.room.localParticipant.unpublishTrack(publication.clonedTrack, false);
        } catch {
            // Best-effort browser cleanup; the authoritative lease state is handled by the API.
        }
        stopClonedInspectionTrack(publication.clonedTrack);
        publication.room.disconnect();
        setActiveLeaseId(null);
    }, []);

    const acknowledgeFailure = useCallback(
        async (
            directive: LiveInspectionDirective,
            errorCode: StudentLiveInspectionPublisherFailureCode,
        ) => {
            onFailure?.(errorCode);
            setPublisherStatus('failed');
            try {
                await acknowledgeLiveInspectionPublisherFailure(apiClient, {
                    sessionId: sessionId ?? '',
                    leaseId: directive.leaseId,
                    revision: directive.revision,
                    errorCode,
                });
            } catch {
                // A stale/terminal lease may reject the failure acknowledgement; do not retry with tokens.
            }
        },
        [apiClient, onFailure, sessionId, setPublisherStatus],
    );

    const startPublication = useCallback(
        async (directive: LiveInspectionDirective, sequence: number) => {
            if (!sessionId || activePublicationRef.current?.leaseId === directive.leaseId) {
                return;
            }

            setPublisherStatus('connecting');
            const originalTrack = getLiveVideoTrack();
            const clonedTrack = cloneCameraTrackForLiveInspection(originalTrack);

            if (!clonedTrack) {
                await acknowledgeFailure(directive, 'NO_LIVE_CAMERA_TRACK');
                return;
            }

            let room: Room | null = null;

            try {
                const credentials = await createLiveInspectionPublisherConnection(apiClient, {
                    sessionId,
                    leaseId: directive.leaseId,
                    revision: directive.revision,
                });

                if (sequence !== requestSequenceRef.current || !isMountedRef.current) {
                    stopClonedInspectionTrack(clonedTrack);
                    return;
                }

                room = new Room({ dynacast: true });
                await room.connect(credentials.liveKitUrl, credentials.token, {
                    autoSubscribe: false,
                });
                await room.localParticipant.publishTrack(clonedTrack, {
                    source: Track.Source.Camera,
                    stopLocalTrackOnUnpublish: false,
                } as Parameters<Room['localParticipant']['publishTrack']>[1]);

                activePublicationRef.current = {
                    leaseId: directive.leaseId,
                    revision: credentials.revision,
                    room,
                    clonedTrack,
                };
                currentRevisionRef.current = credentials.revision;
                setActiveLeaseId(directive.leaseId);

                await acknowledgeLiveInspectionPublisherReady(apiClient, {
                    sessionId,
                    leaseId: directive.leaseId,
                    revision: credentials.revision,
                });

                if (sequence === requestSequenceRef.current && isMountedRef.current) {
                    setPublisherStatus('live');
                }
            } catch {
                if (room) {
                    room.disconnect();
                }
                stopClonedInspectionTrack(clonedTrack);
                await acknowledgeFailure(
                    directive,
                    room ? 'LIVEKIT_PUBLISH_FAILED' : 'LIVEKIT_CONNECT_FAILED',
                );
            }
        },
        [acknowledgeFailure, apiClient, getLiveVideoTrack, sessionId, setPublisherStatus],
    );

    const reconcile = useCallback(async () => {
        if (!enabled || !sessionId) {
            return;
        }

        const sequence = ++requestSequenceRef.current;
        let directive: LiveInspectionDirective;

        try {
            directive = await getStudentLiveInspectionDirective(apiClient, { sessionId });
        } catch {
            if (!activePublicationRef.current) {
                setPublisherStatus('idle');
            }
            return;
        }

        if (sequence !== requestSequenceRef.current || !isMountedRef.current) {
            return;
        }

        const isRoomDisconnected =
            activePublicationRef.current?.room &&
            activePublicationRef.current.room.state === 'disconnected';

        if (
            !isNewerDirective(directive, currentLeaseIdRef.current, currentRevisionRef.current) &&
            !isRoomDisconnected
        ) {
            return;
        }

        currentLeaseIdRef.current = directive.leaseId;
        currentRevisionRef.current = directive.revision;

        if (TERMINAL_STATES.has(directive.state) || directive.state === 'STOPPING') {
            cleanupPublication();
            setPublisherStatus('idle');
            return;
        }

        if (directive.state === 'REQUESTED') {
            setPublisherStatus('requested');
            await startPublication(directive, sequence);
            return;
        }

        if (directive.state === 'PUBLISHER_READY' || directive.state === 'LIVE') {
            setPublisherStatus(activePublicationRef.current ? 'live' : 'idle');
        }
    }, [apiClient, cleanupPublication, enabled, sessionId, setPublisherStatus, startPublication]);

    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
            requestSequenceRef.current += 1;
            cleanupPublication();
        };
    }, [cleanupPublication]);

    useEffect(() => {
        if (!enabled || !sessionId || !attemptId || !supabase) {
            cleanupPublication();
            setPublisherStatus('idle');
            return;
        }

        const topic = `exam-attempt:${attemptId}:live-inspection`;
        const channel: RealtimeChannel = supabase.channel(topic, {
            config: { private: true },
        });

        channel
            .on('broadcast', { event: LIVE_INSPECTION_SIGNAL_EVENT }, () => {
                void reconcile();
            })
            .subscribe();

        void reconcile();

        const intervalId = window.setInterval(() => {
            void reconcile();
        }, RECONCILE_INTERVAL_MS);

        const handleVisibilityOrReconnect = () => {
            void reconcile();
        };

        document.addEventListener('visibilitychange', handleVisibilityOrReconnect);
        window.addEventListener('online', handleVisibilityOrReconnect);

        return () => {
            window.clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityOrReconnect);
            window.removeEventListener('online', handleVisibilityOrReconnect);
            void supabase.removeChannel(channel);
            cleanupPublication();
        };
    }, [
        attemptId,
        cleanupPublication,
        enabled,
        reconcile,
        sessionId,
        setPublisherStatus,
        supabase,
    ]);

    return {
        status,
        isLive: status === 'live',
        activeLeaseId,
    };
}
