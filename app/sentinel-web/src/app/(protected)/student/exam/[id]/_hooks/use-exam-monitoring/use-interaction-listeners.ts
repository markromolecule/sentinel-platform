import { useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import type { ExamConfig } from '@sentinel/shared/types';
import { type SecurityLockReason } from '../../_lib/exam-session-storage';
import { type WebTelemetryEventType, createTelemetryActionMetadata } from '../../_lib/web-telemetry-client';
import { type AttemptMonitoringPhase } from './_types';

/**
 * Hook that sets up document-level and window-level interaction event listeners.
 * Tracks copy/paste/cut, contextmenu (right-click), printscreen shortcuts, focus loss (window blur, visibilitychange), and fullscreen changes.
 * 
 * @param args - Callback functions and flags for enabling/disabling security locks/telemetry.
 */
export function useInteractionListeners(args: {
    configuration?: ExamConfig;
    isMonitoringSuspended: React.MutableRefObject<boolean>;
    isMobile: boolean;
    shouldMonitorVisibility: boolean;
    shouldMonitorFullscreen: boolean;
    emitTelemetryEvent: (
        eventType: WebTelemetryEventType,
        metadata?: { eventId?: string; dedupeKey?: string; clientActionAt?: string },
    ) => void;
    lockExam: (reason: SecurityLockReason) => void;
    setTabSwitches: (fn: (c: number) => number) => void;
    monitoringPhase?: React.MutableRefObject<AttemptMonitoringPhase>;
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
        monitoringPhase,
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
        const metadata = createTelemetryActionMetadata('CLIPBOARD_ATTEMPT');
        emitTelemetryEvent('CLIPBOARD_ATTEMPT', metadata);
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

        const metadata = createTelemetryActionMetadata('TAB_SWITCH');
        emitTelemetryEvent('TAB_SWITCH', metadata);
        lockExam('focus-loss');
        toast.warning('Navigation away from the exam was detected.', {
            description: shortcutNavigationDetected
                ? 'A task-switching shortcut or window change was detected. Return to the secured exam view to continue.'
                : 'Return to the secured exam view to continue.',
        });
    }, [emitTelemetryEvent, isMobile, lockExam, isMonitoringSuspended, setTabSwitches]);

    const handleVisibilityChange = useCallback(() => {
        // Policy: Minimize and window-hidden actions are classified under focus/visibility incidents
        // and must not be silently reclassified as or remapped to fullscreen exits.
        if (!isMonitoringSuspended.current && shouldMonitorVisibility && document.hidden) {
            registerFocusIncident();
        }
    }, [registerFocusIncident, shouldMonitorVisibility, isMonitoringSuspended]);

    const handleWindowBlur = useCallback(() => {
        if (!shouldMonitorVisibility) return;
        setTimeout(() => {
            // Policy: Window blur/loss of focus is tracked separately from fullscreen state.
            if (!isMonitoringSuspended.current && !document.hasFocus() && !document.hidden) {
                registerFocusIncident();
            }
        }, 100);
    }, [registerFocusIncident, shouldMonitorVisibility, isMonitoringSuspended]);

    const handleFullscreenChange = useCallback(() => {
        const currentPhase = monitoringPhase?.current;
        if (
            isMonitoringSuspended.current ||
            !shouldMonitorFullscreen ||
            document.fullscreenElement ||
            currentPhase === 'submitting' ||
            currentPhase === 'navigating-to-turn-in' ||
            currentPhase === 'suspended'
        ) {
            return;
        }

        const now = Date.now();
        if (now - lastFullscreenIncidentAtRef.current < 1000) return;

        lastFullscreenIncidentAtRef.current = now;
        const metadata = createTelemetryActionMetadata('FULL_SCREEN_EXIT');
        emitTelemetryEvent('FULL_SCREEN_EXIT', metadata);
        lockExam('fullscreen-exit');
        toast.warning('Fullscreen is required for this exam.', {
            description: 'Return to fullscreen to continue under the configured policy.',
        });
    }, [shouldMonitorFullscreen, emitTelemetryEvent, lockExam, isMonitoringSuspended, monitoringPhase]);

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
                const metadata = createTelemetryActionMetadata('PRINT_SCREEN_ATTEMPT');
                emitTelemetryEvent('PRINT_SCREEN_ATTEMPT', metadata);
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
                const metadata = createTelemetryActionMetadata('RIGHT_CLICK_ATTEMPT');
                emitTelemetryEvent('RIGHT_CLICK_ATTEMPT', metadata);
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
