import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import {
    readStoredSecurityLock,
    writeStoredSecurityLock,
    clearStoredSecurityLock,
    type SecurityLockReason,
} from '../../_lib/exam-session-storage';

export function useSecurityLock(args: {
    examId: string;
    shouldMonitorFullscreen: boolean;
    isMonitoringSuspended: React.MutableRefObject<boolean>;
}) {
    const { examId, shouldMonitorFullscreen, isMonitoringSuspended } = args;

    const [securityLockReason, setSecurityLockReason] = useState<SecurityLockReason | null>(() => {
        if (typeof window === 'undefined') return null;
        return readStoredSecurityLock(examId);
    });

    const [isResumingExam, setIsResumingExam] = useState(false);
    const fullScreenContainerRef = useRef<HTMLElement | null>(null);

    const lockExam = useCallback(
        (reason: SecurityLockReason) => {
            if (isMonitoringSuspended.current) {
                return;
            }

            setSecurityLockReason(reason);
            writeStoredSecurityLock(examId, reason);
        },
        [examId, isMonitoringSuspended],
    );

    const resumeSecuredExam = useCallback(async () => {
        if (isMonitoringSuspended.current) {
            return;
        }

        if (!fullScreenContainerRef.current) {
            return;
        }

        setIsResumingExam(true);

        try {
            if (shouldMonitorFullscreen && !document.fullscreenElement) {
                await fullScreenContainerRef.current.requestFullscreen();
            }

            setSecurityLockReason(null);
            clearStoredSecurityLock(examId);
        } catch (error: unknown) {
            console.error('Failed to resume secured exam:', error);

            setSecurityLockReason(null);
            clearStoredSecurityLock(examId);
            toast.error(
                'Failed to restore fullscreen mode. Please try to enter fullscreen manually.',
            );
        } finally {
            setIsResumingExam(false);
        }
    }, [examId, shouldMonitorFullscreen, isMonitoringSuspended]);

    const suspendSecurityMonitoring = useCallback(() => {
        isMonitoringSuspended.current = true;
        setSecurityLockReason(null);
        clearStoredSecurityLock(examId);
    }, [examId, isMonitoringSuspended]);

    return {
        securityLockReason,
        setSecurityLockReason,
        isResumingExam,
        fullScreenContainerRef,
        lockExam,
        resumeSecuredExam,
        suspendSecurityMonitoring,
    };
}
