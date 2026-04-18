'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useApi, useAuth } from '@sentinel/hooks';
import { toast } from 'sonner';
import { MOBILE_USER_AGENT_REGEX } from '@sentinel/shared/constants';
import type { ExamConfig } from '@sentinel/shared/types';
import {
    clearStoredSecurityLock,
    readStoredSecurityLock,
    writeStoredSecurityLock,
    type SecurityLockReason,
} from '../_lib/exam-session-storage';
import { emitWebTelemetryEvent, type WebTelemetryEventType } from '../_lib/web-telemetry-client';

type UseExamMonitoringArgs = {
    configuration?: ExamConfig;
    examSessionId?: string;
    examId: string;
};

export type ExamSecurityLockReason = SecurityLockReason;

export function useExamMonitoring({ configuration, examSessionId, examId }: UseExamMonitoringArgs) {
    const apiClient = useApi();
    const { user } = useAuth();
    const [tabSwitches, setTabSwitches] = useState(0);
    const [securityLockReason, setSecurityLockReason] = useState<SecurityLockReason | null>(() => {
        return readStoredSecurityLock(examId);
    });
    const [isResumingExam, setIsResumingExam] = useState(false);
    const lastFocusIncidentAtRef = useRef(0);
    const lastNavigationShortcutAtRef = useRef(0);
    const fullScreenContainerRef = useRef<HTMLElement | null>(null);
    const studentId = user?.id;
    const isMobile =
        typeof window !== 'undefined' && MOBILE_USER_AGENT_REGEX.test(window.navigator.userAgent);

    const emitTelemetryEvent = useCallback(
        (eventType: WebTelemetryEventType) => {
            if (!examSessionId || !studentId || isMobile) {
                return;
            }

            void emitWebTelemetryEvent(apiClient, {
                configuration,
                examSessionId,
                studentId,
                eventType,
            }).catch((error) => {
                console.error('Failed to emit web telemetry event.', {
                    eventType,
                    error,
                });
            });
        },
        [apiClient, configuration, examSessionId, isMobile, studentId],
    );

    const shouldMonitorVisibility = isMobile
        ? (configuration?.mobileSecurity.prevent_backgrounding ?? true)
        : (configuration?.webSecurity.tab_switching_monitor ?? true);

    const shouldMonitorFullscreen =
        !isMobile && (configuration?.webSecurity.full_screen_required ?? true);

    const lockExam = useCallback(
        (reason: SecurityLockReason) => {
            setSecurityLockReason(reason);
            writeStoredSecurityLock(examId, reason);
        },
        [examId],
    );

    const registerFocusIncident = useCallback(() => {
        const now = Date.now();

        // `blur` and `visibilitychange` frequently fire back-to-back for the same incident.
        if (now - lastFocusIncidentAtRef.current < 1000) {
            return;
        }

        lastFocusIncidentAtRef.current = now;
        const shortcutNavigationDetected = now - lastNavigationShortcutAtRef.current < 1500;
        setTabSwitches((current) => current + 1);

        if (isMobile) {
            toast.error('Warning: You left the exam screen!', {
                description: 'Incident logged.',
            });
            return;
        }

        emitTelemetryEvent('TAB_SWITCH');
        lockExam('focus-loss');
        toast.warning('Navigation away from the exam was detected.', {
            description: shortcutNavigationDetected
                ? 'A task-switching shortcut or window change was detected. Return to the secured exam view to continue.'
                : 'Return to the secured exam view to continue.',
        });
    }, [emitTelemetryEvent, isMobile, lockExam]);

    const handleVisibilityChange = useCallback(() => {
        if (!shouldMonitorVisibility) {
            return;
        }

        if (document.hidden) {
            registerFocusIncident();
        }
    }, [registerFocusIncident, shouldMonitorVisibility]);

    const handleWindowBlur = useCallback(() => {
        if (!shouldMonitorVisibility) {
            return;
        }

        // Delay slightly to confirm that focus is truly lost and hasn't just moved to another part of the window
        // (e.g., clicking on a custom dropdown or iframe)
        setTimeout(() => {
            if (!document.hasFocus() && !document.hidden) {
                registerFocusIncident();
            }
        }, 100);
    }, [registerFocusIncident, shouldMonitorVisibility]);

    const handleFullscreenChange = useCallback(() => {
        if (!shouldMonitorFullscreen) {
            return;
        }

        if (!document.fullscreenElement) {
            emitTelemetryEvent('FULL_SCREEN_EXIT');
            lockExam('fullscreen-exit');
            toast.warning('Fullscreen is required for this exam.', {
                description: 'Return to fullscreen to continue under the configured policy.',
            });
        }
    }, [shouldMonitorFullscreen, emitTelemetryEvent, lockExam]);

    const blockClipboardEvent = useCallback(
        (event: ClipboardEvent) => {
            if (!(configuration?.webSecurity.clipboard_control ?? true) || isMobile) {
                return;
            }

            event.preventDefault();
            emitTelemetryEvent('CLIPBOARD_ATTEMPT');
            toast.warning('Clipboard actions are disabled for this exam.');
        },
        [configuration?.webSecurity.clipboard_control, emitTelemetryEvent, isMobile],
    );

    const blockContextMenu = useCallback(
        (event: MouseEvent) => {
            if (!(configuration?.webSecurity.right_click_disable ?? true) || isMobile) {
                return;
            }

            event.preventDefault();
            emitTelemetryEvent('RIGHT_CLICK_ATTEMPT');
        },
        [configuration?.webSecurity.right_click_disable, emitTelemetryEvent, isMobile],
    );

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (shouldMonitorVisibility && event.key === 'Tab' && (event.altKey || event.metaKey)) {
                lastNavigationShortcutAtRef.current = Date.now();
            }

            if (!(configuration?.webSecurity.print_screen_disable ?? true) || isMobile) {
                return;
            }

            const normalizedKey = event.key.toLowerCase();
            const isPrintScreenKey =
                event.key === 'PrintScreen' ||
                event.code === 'PrintScreen' ||
                normalizedKey === 'printscreen';
            const isMacCaptureShortcut =
                event.metaKey && event.shiftKey && ['3', '4', '5'].includes(normalizedKey);
            const isWindowsCaptureShortcut =
                event.metaKey && event.shiftKey && normalizedKey === 's';

            if (isPrintScreenKey || isMacCaptureShortcut || isWindowsCaptureShortcut) {
                event.preventDefault();
                emitTelemetryEvent('PRINT_SCREEN_ATTEMPT');
                lockExam('screen-capture');
                toast.warning('Screen capture shortcuts are blocked or monitored for this exam.', {
                    description: 'Return to the exam only when screen capture tools are closed.',
                });
            }
        },
        [
            configuration?.webSecurity.print_screen_disable,
            emitTelemetryEvent,
            isMobile,
            lockExam,
            shouldMonitorVisibility,
        ],
    );

    const resumeSecuredExam = useCallback(async () => {
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
        } catch (error) {
            console.error('Failed to resume secured exam:', error);
            toast.error('Failed to restore fullscreen mode. Please try again.');
        } finally {
            setIsResumingExam(false);
        }
    }, [examId, shouldMonitorFullscreen]);

    useEffect(() => {
        if (shouldMonitorFullscreen) {
            const fullscreenRequest = document.documentElement.requestFullscreen?.();
            fullscreenRequest?.catch(() => null);
        }

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('copy', blockClipboardEvent);
        document.addEventListener('cut', blockClipboardEvent);
        document.addEventListener('paste', blockClipboardEvent);
        document.addEventListener('contextmenu', blockContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        const shouldWarnBeforeUnload =
            configuration?.screenLock ||
            configuration?.webSecurity.full_screen_required ||
            configuration?.mobileSecurity.prevent_backgrounding;

        const beforeUnloadHandler = (event: BeforeUnloadEvent) => {
            if (!shouldWarnBeforeUnload) {
                return;
            }

            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', beforeUnloadHandler);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleWindowBlur);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('copy', blockClipboardEvent);
            document.removeEventListener('cut', blockClipboardEvent);
            document.removeEventListener('paste', blockClipboardEvent);
            document.removeEventListener('contextmenu', blockContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('beforeunload', beforeUnloadHandler);
        };
    }, [
        blockClipboardEvent,
        blockContextMenu,
        configuration?.mobileSecurity.prevent_backgrounding,
        configuration?.screenLock,
        configuration?.webSecurity.full_screen_required,
        handleFullscreenChange,
        handleKeyDown,
        handleVisibilityChange,
        handleWindowBlur,
        isMobile,
        shouldMonitorFullscreen,
    ]);

    return {
        tabSwitches,
        isMobile,
        securityLockReason,
        isResumingExam,
        resumeSecuredExam,
        fullScreenContainerRef,
    };
}
