import { useState, useRef, useCallback, useEffect, type RefObject } from 'react';
import { useApi, useAuth } from '@sentinel/hooks';
import {
    getStudentLiveInspectionDirective,
    createLiveInspectionPublisherConnection,
    acknowledgeLiveInspectionPublisherReady,
    acknowledgeLiveInspectionPublisherFailure,
} from '@sentinel/services';
import type { LiveInspectionDirective } from '@sentinel/shared/schema';
import type { MobileMediaPipeBridgeRef } from '../components/checkup/mobile-mediapipe-bridge';
import {
    isLiveInspectionPublishState,
    isLiveInspectionStopState,
    isLiveInspectionNotFoundError,
} from '../lib/mobile-live-inspection';

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
 * Custom hook managing LiveKit live inspection publisher lifecycle on mobile.
 * Connects the mobile camera stream to proctoring network via the MediaPipe WebView bridge.
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

    const stopPublication = useCallback(async () => {
        if (!activeLeaseIdRef.current) return;
        activeLeaseIdRef.current = null;
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

        try {
            const directive: LiveInspectionDirective = await getStudentLiveInspectionDirective(apiClient, {
                sessionId,
            });

            if (isLiveInspectionPublishState(directive.state)) {
                if (activeLeaseIdRef.current === directive.leaseId && isLive) {
                    return; // Already publishing for this lease
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

                if (connection?.liveKitUrl && connection?.token) {
                    await mediaPipeRef?.current?.startLiveInspection({
                        liveKitUrl: connection.liveKitUrl,
                        token: connection.token,
                    });

                    await acknowledgeLiveInspectionPublisherReady(apiClient, {
                        sessionId,
                        leaseId: directive.leaseId,
                        revision: directive.revision,
                    });

                    setIsLive(true);
                }
            } else if (isLiveInspectionStopState(directive.state)) {
                await stopPublication();
            }
        } catch (err: any) {
            if (!isLiveInspectionNotFoundError(err)) {
                console.warn('Live inspection directive reconciliation failed:', err);
            }

            if (activeLeaseIdRef.current) {
                try {
                    await acknowledgeLiveInspectionPublisherFailure(apiClient, {
                        sessionId,
                        leaseId: activeLeaseIdRef.current,
                        revision: 1,
                        errorCode: 'LIVEKIT_CONNECT_FAILED',
                    });
                } catch { }
            }
            await stopPublication();
        }
    }, [apiClient, enabled, isLive, mediaPipeRef, sessionId, stopPublication]);

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
