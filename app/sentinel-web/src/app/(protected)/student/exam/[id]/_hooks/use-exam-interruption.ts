import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    writeStoredReconnectIntent,
    readStoredReconnectIntent,
    type ReconnectReason,
} from '../_lib/exam-session-storage';

type UseExamInterruptionArgs = {
    examId: string;
    sessionId?: string | null;
    isEnabled?: boolean;
    isNavigationCommitted?: boolean;
    onBeforeInterruption?: () => void;
};

/**
 * Tracks interruption signals (pagehide, beforeunload, offline) during an exam attempt.
 * Logs reconnect intent without blocking unload fetches and routes to lobby on reconnect.
 */
export function useExamInterruption({
    examId,
    sessionId,
    isEnabled = true,
    isNavigationCommitted = false,
    onBeforeInterruption,
}: UseExamInterruptionArgs) {
    const router = useRouter();

    useEffect(() => {
        if (!isEnabled || typeof window === 'undefined' || !examId) {
            return;
        }

        const handleInterruption = (reason: ReconnectReason) => {
            if (isNavigationCommitted) {
                return;
            }

            onBeforeInterruption?.();
            writeStoredReconnectIntent(examId, sessionId ?? undefined, reason);
        };

        const onPageHide = () => handleInterruption('close');
        const onBeforeUnload = () => handleInterruption('reload');
        const onOffline = () => handleInterruption('offline');

        const onOnline = () => {
            const intent = readStoredReconnectIntent(examId);
            if (intent && window.location.pathname.endsWith('/attempt')) {
                router.replace(`/student/exam/${examId}/lobby`);
            }
        };

        window.addEventListener('pagehide', onPageHide);
        window.addEventListener('beforeunload', onBeforeUnload);
        window.addEventListener('offline', onOffline);
        window.addEventListener('online', onOnline);

        return () => {
            window.removeEventListener('pagehide', onPageHide);
            window.removeEventListener('beforeunload', onBeforeUnload);
            window.removeEventListener('offline', onOffline);
            window.removeEventListener('online', onOnline);
        };
    }, [examId, isEnabled, isNavigationCommitted, onBeforeInterruption, router, sessionId]);
}
