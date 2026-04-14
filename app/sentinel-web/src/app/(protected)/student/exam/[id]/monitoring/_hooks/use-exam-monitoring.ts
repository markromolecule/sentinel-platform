'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApi, useAuth } from '@sentinel/hooks';
import { toast } from 'sonner';
import { MOBILE_USER_AGENT_REGEX } from '@sentinel/shared/constants';
import type { ExamConfig } from '@sentinel/shared/types';
import { emitWebTelemetryEvent, type WebTelemetryEventType } from '../_lib/web-telemetry-client';

type UseExamMonitoringArgs = {
    configuration?: ExamConfig;
    examSessionId?: string;
};

export function useExamMonitoring({ configuration, examSessionId }: UseExamMonitoringArgs) {
    const apiClient = useApi();
    const { user } = useAuth();
    const [tabSwitches, setTabSwitches] = useState(0);
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

    // Visibility Change Handler
    const handleVisibilityChange = useCallback(() => {
        if (!shouldMonitorVisibility) {
            return;
        }

        if (document.hidden) {
            setTabSwitches((prev) => prev + 1);
            if (isMobile) {
                toast.error('Warning: You left the exam screen!', {
                    description: 'Incident logged.',
                });
            } else {
                emitTelemetryEvent('TAB_SWITCH');
                toast.warning('Warning: Navigation detected!', {
                    description: 'Stay on the exam page.',
                });
            }
        }
    }, [emitTelemetryEvent, isMobile, shouldMonitorVisibility]);

    const handleFullscreenChange = useCallback(() => {
        if (isMobile || !(configuration?.webSecurity.full_screen_required ?? true)) {
            return;
        }

        if (!document.fullscreenElement) {
            emitTelemetryEvent('FULL_SCREEN_EXIT');
            toast.warning('Fullscreen is required for this exam.', {
                description: 'Return to fullscreen to continue under the configured policy.',
            });
        }
    }, [configuration?.webSecurity.full_screen_required, emitTelemetryEvent, isMobile]);

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
            if (!(configuration?.webSecurity.print_screen_disable ?? true) || isMobile) {
                return;
            }

            if (event.key === 'PrintScreen') {
                event.preventDefault();
                emitTelemetryEvent('PRINT_SCREEN_ATTEMPT');
                toast.warning('Screen capture shortcuts are blocked or monitored for this exam.');
            }
        },
        [configuration?.webSecurity.print_screen_disable, emitTelemetryEvent, isMobile],
    );

    useEffect(() => {
        if (configuration?.webSecurity.full_screen_required && !isMobile) {
            const fullscreenRequest = document.documentElement.requestFullscreen?.();
            fullscreenRequest?.catch(() => null);
        }

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleVisibilityChange);
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
            window.removeEventListener('blur', handleVisibilityChange);
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
        isMobile,
    ]);

    return {
        tabSwitches,
        isMobile,
    };
}
