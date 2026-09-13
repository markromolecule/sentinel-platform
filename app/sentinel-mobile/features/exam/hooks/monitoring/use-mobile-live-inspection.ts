import { useState, useRef, useCallback, useEffect, type RefObject } from 'react';
import { useApi, useAuth } from '@sentinel/hooks';
import {
    getStudentLiveInspectionDirective,
    createLiveInspectionPublisherConnection,
    acknowledgeLiveInspectionPublisherReady,
    acknowledgeLiveInspectionPublisherFailure,
} from '@sentinel/services';
import type { LiveInspectionDirective } from '@sentinel/shared/schema';
import type { MobileMediaPipeBridgeRef } from '@/features/exam/components/checkup/mobile-mediapipe-bridge';
import {
    isLiveInspectionPublishState,
    isLiveInspectionStopState,
    isLiveInspectionNotFoundError,
} from '@/features/exam/lib/mobile-live-inspection';

export interface UseMobileLiveInspectionOptions {
    sessionId: string | null;
    attemptId?: string | null;
    enabled: boolean;
    mediaPipeRef?: RefObject<MobileMediaPipeBridgeRef | null>;
    getLiveVideoTrack?: () => any;
}

export interface UseMobileLiveInspectionReturn {
    isLive: boolean;
    stopPublication: () => Promise<void>;
    reconcileDirective: () => Promise<void>;
}

/**
 * Returns true if an error indicates the server rejected the call because the
 * lease version changed concurrently (HTTP 409). In that case the caller should
 * treat the error as a no-op rather than triggering a failure acknowledgement
 * that would terminate the legitimate, already-active stream.
 */
function isLeaseConflictError(err: unknown): boolean {
    if (!err || typeof err !== 'object') return false;
    const e = err as Record<string, any>;
    const status = e.status ?? e.statusCode ?? e.response?.status;
    const message = typeof e.message === 'string' ? e.message : '';
    return (
        status === 409 ||
        message.toLowerCase().includes('lease changed') ||
        message.toLowerCase().includes('lease version')
    );
}

/**
 * Custom hook managing LiveKit live inspection publisher lifecycle on mobile.
 * Connects the mobile camera stream to proctoring network via the MediaPipe WebView bridge.
 *
 * Key invariants:
 *  - isReconcilingRef acts as a mutex so concurrent Realtime broadcasts don't
 *    spawn overlapping reconcile calls that generate stale revision conflicts.
 *  - isLiveRef mirrors the isLive state so the callback closure always reads
 *    the current value instead of a stale snapshot captured at render time.
 *  - 409 "lease changed" errors in the catch block are silently dropped; they
 *    indicate the server already advanced the lease (e.g., PUBLISHER_READY was
 *    broadcast before this call finished), so NO failure acknowledgement or
 *    stopPublication should be issued.
 */
export function useMobileLiveInspection({
    sessionId,
    attemptId: _attemptId,
    enabled,
    mediaPipeRef,
}: UseMobileLiveInspectionOptions): UseMobileLiveInspectionReturn {
    const apiClient = useApi();
    const { supabase } = useAuth();

    const [isLive, setIsLive] = useState(false);
    const activeLeaseIdRef = useRef<string | null>(null);

    // Mutex: prevents concurrent reconcile executions that would race on
    // revision numbers and generate 409 conflicts on the server.
    const isReconcilingRef = useRef(false);
    // Mirrors isLive so the async callback always sees the latest value.
    const isLiveRef = useRef(false);

    const stopPublication = useCallback(async () => {
        if (!activeLeaseIdRef.current) return;
        activeLeaseIdRef.current = null;
        isLiveRef.current = false;
        setIsLive(false);
        try {
            await mediaPipeRef?.current?.stopLiveInspection();
        } catch (e) {
            console.warn('Failed to stop LiveKit inspection stream:', e);
        }
    }, [mediaPipeRef]);

    const reconcileDirective = useCallback(async () => {
        if (!enabled || !sessionId) {
            return;
        }

        // Serialize calls — skip if one is already in flight.
        if (isReconcilingRef.current) {
            return;
        }
        isReconcilingRef.current = true;

        let activeRevision = 1;

        try {
            const directive: LiveInspectionDirective = await getStudentLiveInspectionDirective(apiClient, {
                sessionId,
            });

            activeRevision = directive.revision;

            if (isLiveInspectionPublishState(directive.state)) {
                // Already publishing for this exact lease — skip to avoid 409.
                if (activeLeaseIdRef.current === directive.leaseId && isLiveRef.current) {
                    return;
                }

                activeLeaseIdRef.current = directive.leaseId;

                let connection = directive.connection;
                if (!connection) {
                    connection = await createLiveInspectionPublisherConnection(apiClient, {
                        sessionId,
                        leaseId: directive.leaseId,
                        revision: directive.revision,
                    });
                }

                activeRevision = connection?.revision ?? directive.revision;

                if (connection?.liveKitUrl && connection?.token) {
                    await mediaPipeRef?.current?.startLiveInspection({
                        liveKitUrl: connection.liveKitUrl,
                        token: connection.token,
                    });

                    await acknowledgeLiveInspectionPublisherReady(apiClient, {
                        sessionId,
                        leaseId: directive.leaseId,
                        revision: activeRevision,
                    });

                    isLiveRef.current = true;
                    setIsLive(true);
                }
            } else if (isLiveInspectionStopState(directive.state)) {
                await stopPublication();
            }
        } catch (err: any) {
            // 404: live inspection simply not active yet — silent, expected state.
            if (isLiveInspectionNotFoundError(err)) {
                return;
            }

            // 409 lease conflict: the server already advanced the lease revision
            // (race with another broadcast). The existing stream is still valid —
            // do NOT acknowledge failure or stop publishing.
            if (isLeaseConflictError(err)) {
                console.warn('Live inspection lease conflict (concurrent reconcile) — skipping failure acknowledgement.', err?.message);
                return;
            }

            // Genuine connection / WebRTC failure.
            console.warn('Live inspection directive reconciliation failed:', err);

            if (activeLeaseIdRef.current) {
                try {
                    await acknowledgeLiveInspectionPublisherFailure(apiClient, {
                        sessionId,
                        leaseId: activeLeaseIdRef.current,
                        revision: activeRevision,
                        errorCode: 'LIVEKIT_CONNECT_FAILED',
                    });
                } catch { }
            }
            await stopPublication();
        } finally {
            isReconcilingRef.current = false;
        }
    }, [apiClient, enabled, mediaPipeRef, sessionId, stopPublication]);

    useEffect(() => {
        if (!enabled || !sessionId) {
            void stopPublication();
            return;
        }

        // Initial directive check
        void reconcileDirective();

        // Subscribe to Supabase realtime events on exam_sessions channel
        const channel = supabase
            ?.channel?.(`exam_sessions:${sessionId}`)
            ?.on('broadcast', { event: 'LIVE_INSPECTION_CHANGED' }, () => {
                void reconcileDirective();
            })
            ?.subscribe?.();

        const pollInterval = setInterval(() => {
            void reconcileDirective();
        }, 10000);

        return () => {
            clearInterval(pollInterval);
            if (channel && supabase?.removeChannel) {
                void supabase.removeChannel(channel);
            }
            void stopPublication();
        };
    }, [enabled, reconcileDirective, sessionId, stopPublication, supabase]);

    return {
        isLive,
        stopPublication,
        reconcileDirective,
    };
}
