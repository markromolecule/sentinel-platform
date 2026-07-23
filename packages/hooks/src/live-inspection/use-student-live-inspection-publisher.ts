'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { LiveInspectionDirective, LiveInspectionState } from '@sentinel/shared/schema';
import { getStudentLiveInspectionDirective, ApiError } from '@sentinel/services';
import { useStudentLiveInspectionPublication } from './use-student-live-inspection-publication';
import {
    StudentLiveInspectionPublisherStatus,
    UseStudentLiveInspectionPublisherArgs,
} from './use-student-live-inspection-publisher.types';
import {
    isNewerDirective,
    logLocalDiagnostic,
    useLatestRef,
} from './use-student-live-inspection-publisher.helpers';

// Re-export types for consumer backwards compatibility
export * from './use-student-live-inspection-publisher.types';

const LIVE_INSPECTION_SIGNAL_EVENT = 'LIVE_INSPECTION_CHANGED';
const TERMINAL_STATES = new Set<LiveInspectionState>(['ENDED', 'FAILED', 'EXPIRED']);

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
    // ------------------------------------------------------------------------
    // 1. Stable Callback & Prop References
    // ------------------------------------------------------------------------
    const onStatusChangeRef = useLatestRef(onStatusChange);
    const apiClientRef = useLatestRef(apiClient);

    // ------------------------------------------------------------------------
    // 2. State & Refs Initialization
    // ------------------------------------------------------------------------
    const [status, setStatus] = useState<StudentLiveInspectionPublisherStatus>('idle');

    const requestSequenceRef = useRef(0);
    const isMountedRef = useRef(false);
    const reconcileTimerRef = useRef<any>(null);
    const isReconcilingRef = useRef(false);
    const statusRef = useRef<StudentLiveInspectionPublisherStatus>('idle');
    const isSuspendedRef = useRef(false);

    const setPublisherStatus = useCallback(
        (nextStatus: StudentLiveInspectionPublisherStatus) => {
            statusRef.current = nextStatus;
            setStatus(nextStatus);
            onStatusChangeRef.current?.(nextStatus);
        },
        []
    );

    // ------------------------------------------------------------------------
    // 3. Delegate publication actions and state to sub-hook
    // ------------------------------------------------------------------------
    const {
        activeLeaseId,
        activePublicationRef,
        currentLeaseIdRef,
        currentRevisionRef,
        cleanupPublication,
        startPublication,
    } = useStudentLiveInspectionPublication({
        apiClient,
        sessionId,
        enabled,
        getLiveVideoTrack,
        requestSequenceRef,
        isMountedRef,
        statusRef,
        setPublisherStatus,
        onFailure,
        runReconcileNow: async () => {
            await runReconcileNow();
        },
    });

    // ------------------------------------------------------------------------
    // 4. Directive Reconciliation
    // ------------------------------------------------------------------------
    const reconcile = useCallback(async () => {
        if (!enabled || !sessionId || isSuspendedRef.current) {
            return;
        }

        const sequence = ++requestSequenceRef.current;
        let directive: LiveInspectionDirective;

        try {
            directive = await getStudentLiveInspectionDirective(apiClientRef.current, {
                sessionId,
            });
        } catch (error) {
            const isApiError = error instanceof ApiError;
            const status = isApiError ? error.status : undefined;

            if (status === 401 || status === 403) {
                isSuspendedRef.current = true;
                logLocalDiagnostic('fetch_directive_suspended', error);
                if (!activePublicationRef.current) {
                    setPublisherStatus('idle');
                }
            } else if (status === 404) {
                // 404 means no active directive, which is normal.
                // Do not treat as an error or log diagnostic.
                if (!activePublicationRef.current) {
                    setPublisherStatus('idle');
                }
            } else {
                logLocalDiagnostic('fetch_directive', error);
                if (!activePublicationRef.current) {
                    setPublisherStatus('idle');
                }
            }
            return;
        }

        if (sequence !== requestSequenceRef.current || !isMountedRef.current) {
            return;
        }

        const isRoomDisconnected =
            activePublicationRef.current?.room &&
            activePublicationRef.current.room.state === 'disconnected';

        const isAlreadyConnecting =
            (statusRef.current === 'connecting' || statusRef.current === 'requested') &&
            directive.leaseId === currentLeaseIdRef.current &&
            directive.revision === currentRevisionRef.current;

        if (isAlreadyConnecting && !isRoomDisconnected) {
            return;
        }

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
    }, [cleanupPublication, enabled, sessionId, setPublisherStatus, startPublication]);

    // ------------------------------------------------------------------------
    // 5. Scheduling Helpers
    // ------------------------------------------------------------------------
    const scheduleReconcile = useCallback(() => {
        if (reconcileTimerRef.current) {
            window.clearTimeout(reconcileTimerRef.current);
        }
        if (!enabled || !sessionId || !isMountedRef.current) {
            return;
        }
        reconcileTimerRef.current = window.setTimeout(async () => {
            if (isReconcilingRef.current) {
                scheduleReconcile();
                return;
            }
            isReconcilingRef.current = true;
            try {
                await reconcile();
            } finally {
                isReconcilingRef.current = false;
                scheduleReconcile();
            }
        }, 3000);
    }, [enabled, sessionId, reconcile]);

    const runReconcileNow = useCallback(async () => {
        isSuspendedRef.current = false;
        if (!isMountedRef.current || !enabled || !sessionId) return;
        if (isReconcilingRef.current) return;
        isReconcilingRef.current = true;
        try {
            await reconcile();
        } finally {
            isReconcilingRef.current = false;
            scheduleReconcile();
        }
    }, [enabled, sessionId, reconcile, scheduleReconcile]);

    // ------------------------------------------------------------------------
    // 6. Lifecycle & Event Effects
    // ------------------------------------------------------------------------
    useEffect(() => {
        isMountedRef.current = true;
        isSuspendedRef.current = false;

        return () => {
            isMountedRef.current = false;
            requestSequenceRef.current += 1;
            cleanupPublication();
            if (reconcileTimerRef.current) {
                window.clearTimeout(reconcileTimerRef.current);
            }
        };
    }, [cleanupPublication]);

    useEffect(() => {
        if (!enabled || !sessionId || !attemptId || !supabase) {
            requestSequenceRef.current += 1;
            cleanupPublication();
            setPublisherStatus('idle');
            isSuspendedRef.current = false;
            if (reconcileTimerRef.current) {
                window.clearTimeout(reconcileTimerRef.current);
            }
            return;
        }

        const topic = `exam-attempt:${attemptId}:live-inspection`;
        const channel: RealtimeChannel = supabase.channel(topic, {
            config: { private: true },
        });

        channel
            .on('broadcast', { event: LIVE_INSPECTION_SIGNAL_EVENT }, () => {
                void runReconcileNow();
            })
            .subscribe();

        void runReconcileNow();

        const handleVisibilityOrReconnect = () => {
            void runReconcileNow();
        };

        document.addEventListener('visibilitychange', handleVisibilityOrReconnect);
        window.addEventListener('online', handleVisibilityOrReconnect);

        return () => {
            requestSequenceRef.current += 1;
            if (reconcileTimerRef.current) {
                window.clearTimeout(reconcileTimerRef.current);
            }
            document.removeEventListener('visibilitychange', handleVisibilityOrReconnect);
            window.removeEventListener('online', handleVisibilityOrReconnect);
            void supabase.removeChannel(channel);
            cleanupPublication();
        };
    }, [
        attemptId,
        cleanupPublication,
        enabled,
        runReconcileNow,
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
