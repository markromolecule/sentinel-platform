import { useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import type { ExamConfig } from '@sentinel/shared/types';
import { type SecurityLockReason } from '../../_lib/exam-session-storage';
import type { WebTelemetryEventType } from '../../_lib/web-telemetry-client';

export function useInteractionListeners(args: {
    configuration?: ExamConfig;
    isMonitoringSuspended: React.MutableRefObject<boolean>;
    isMobile: boolean;
    shouldMonitorVisibility: boolean;
    shouldMonitorFullscreen: boolean;
    emitTelemetryEvent: (eventType: WebTelemetryEventType) => void;
    lockExam: (reason: SecurityLockReason) => void;
    setTabSwitches: (fn: (c: number) => number) => void;
}) {
    const {
        configuration,
        isMonitoringSuspended,
        isMobile,
        shouldMonitorVisibility,
        shouldMonitorFullscreen,
        emitTelemetryEvent,
        lockExam,
        setTabSwitches,
    } = args;

    const lastFocusIncidentAtRef = useRef(0);
    const lastNavigationShortcutAtRef = useRef(0);
    const lastClipboardIncidentAtRef = useRef(0);
    const lastPrintScreenIncidentAtRef = useRef(0);
    const lastRightClickIncidentAtRef = useRef(0);
    const lastFullscreenIncidentAtRef = useRef(0);

    const registerClipboardIncident = useCallback(() => {
        if (isMonitoringSuspended.current) return;
        const now = Date.now();
        if (now - lastClipboardIncidentAtRef.current < 800) return;

        lastClipboardIncidentAtRef.current = now;
        emitTelemetryEvent('CLIPBOARD_ATTEMPT');
        toast.warning('Clipboard actions are disabled for this exam.');
    }, [emitTelemetryEvent, isMonitoringSuspended]);

    const registerFocusIncident = useCallback(() => {
        if (isMonitoringSuspended.current) return;
        const now = Date.now();
        if (now - lastFocusIncidentAtRef.current < 1000) return;

        lastFocusIncidentAtRef.current = now;
        const shortcutNavigationDetected = now - lastNavigationShortcutAtRef.current < 1500;
        setTabSwitches((current) => current + 1);

        if (isMobile) {
            toast.error('Warning: You left the exam screen!', { description: 'Incident logged.' });
            return;
        }

        emitTelemetryEvent('TAB_SWITCH');
        lockExam('focus-loss');
        toast.warning('Navigation away from the exam was detected.', {
            description: shortcutNavigationDetected
                ? 'A task-switching shortcut or window change was detected. Return to the secured exam view to continue.'
                : 'Return to the secured exam view to continue.',
        });
    }, [emitTelemetryEvent, isMobile, lockExam, isMonitoringSuspended, setTabSwitches]);

    const handleVisibilityChange = useCallback(() => {
        if (!isMonitoringSuspended.current && shouldMonitorVisibility && document.hidden) {
            registerFocusIncident();
        }
    }, [registerFocusIncident, shouldMonitorVisibility, isMonitoringSuspended]);

    const handleWindowBlur = useCallback(() => {
        if (!shouldMonitorVisibility) return;
        setTimeout(() => {
            if (!isMonitoringSuspended.current && !document.hasFocus() && !document.hidden) {
                registerFocusIncident();
            }
        }, 100);
    }, [registerFocusIncident, shouldMonitorVisibility, isMonitoringSuspended]);

    const handleFullscreenChange = useCallback(() => {
        if (
            isMonitoringSuspended.current ||
            !shouldMonitorFullscreen ||
            document.fullscreenElement
        ) {
            return;
        }

        const now = Date.now();
        if (now - lastFullscreenIncidentAtRef.current < 1000) return;

        lastFullscreenIncidentAtRef.current = now;
        emitTelemetryEvent('FULL_SCREEN_EXIT');
        lockExam('fullscreen-exit');
        toast.warning('Fullscreen is required for this exam.', {
            description: 'Return to fullscreen to continue under the configured policy.',
        });
    }, [shouldMonitorFullscreen, emitTelemetryEvent, lockExam, isMonitoringSuspended]);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (isMonitoringSuspended.current) return;

            if (shouldMonitorVisibility && event.key === 'Tab' && (event.altKey || event.metaKey)) {
                lastNavigationShortcutAtRef.current = Date.now();
            }

            if ((configuration?.webSecurity.clipboard_control ?? true) && !isMobile) {
                const normalizedKey = event.key.toLowerCase();
                if ((event.ctrlKey || event.metaKey) && ['c', 'x', 'v'].includes(normalizedKey)) {
                    event.preventDefault();
                    registerClipboardIncident();
                    return;
                }
            }

            if (!(configuration?.webSecurity.print_screen_disable ?? true) || isMobile) return;

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
                const now = Date.now();
                if (now - lastPrintScreenIncidentAtRef.current < 800) return;

                lastPrintScreenIncidentAtRef.current = now;
                emitTelemetryEvent('PRINT_SCREEN_ATTEMPT');
                lockExam('screen-capture');
                toast.warning('Screen capture shortcuts are blocked or monitored for this exam.', {
                    description: 'Return to the exam only when screen capture tools are closed.',
                });
            }
        },
        [
            configuration?.webSecurity,
            emitTelemetryEvent,
            isMobile,
            lockExam,
            registerClipboardIncident,
            shouldMonitorVisibility,
            isMonitoringSuspended,
        ],
    );

    useEffect(() => {
        if (shouldMonitorFullscreen && !isMonitoringSuspended.current) {
            document.documentElement.requestFullscreen?.()?.catch(() => null);
        }

        const blockClipboard = (e: ClipboardEvent) => {
            if (
                !isMonitoringSuspended.current &&
                (configuration?.webSecurity.clipboard_control ?? true) &&
                !isMobile
            ) {
                e.preventDefault();
                registerClipboardIncident();
            }
        };

        const blockContextMenu = (e: MouseEvent) => {
            if (
                !isMonitoringSuspended.current &&
                (configuration?.webSecurity.right_click_disable ?? true) &&
                !isMobile
            ) {
                e.preventDefault();
                const now = Date.now();
                if (now - lastRightClickIncidentAtRef.current < 800) return;

                lastRightClickIncidentAtRef.current = now;
                emitTelemetryEvent('RIGHT_CLICK_ATTEMPT');
                lockExam('right-click');
                toast.warning('Right-click actions are disabled for this exam.', {
                    description: 'The attempt remains secured while this event is logged.',
                });
            }
        };

        const beforeUnloadHandler = (event: BeforeUnloadEvent) => {
            const shouldWarn =
                configuration?.screenLock ||
                configuration?.webSecurity.full_screen_required ||
                configuration?.mobileSecurity.prevent_backgrounding;
            if (!isMonitoringSuspended.current && shouldWarn) {
                event.preventDefault();
                event.returnValue = '';
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('copy', blockClipboard);
        document.addEventListener('cut', blockClipboard);
        document.addEventListener('paste', blockClipboard);
        document.addEventListener('contextmenu', blockContextMenu);
        document.addEventListener('keydown', handleKeyDown);
        window.addEventListener('beforeunload', beforeUnloadHandler);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleWindowBlur);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('copy', blockClipboard);
            document.removeEventListener('cut', blockClipboard);
            document.removeEventListener('paste', blockClipboard);
            document.removeEventListener('contextmenu', blockContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('beforeunload', beforeUnloadHandler);
        };
    }, [
        configuration,
        emitTelemetryEvent,
        handleFullscreenChange,
        handleKeyDown,
        handleVisibilityChange,
        handleWindowBlur,
        isMobile,
        isMonitoringSuspended,
        lockExam,
        registerClipboardIncident,
        shouldMonitorFullscreen,
    ]);
}
