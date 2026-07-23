import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import {
    createTelemetryActionMetadata,
    detectScreenCaptureShortcut,
} from '../../../_lib/web-telemetry-client';
import { evaluateActionBurst } from '../../../_lib/web-telemetry-client/_utils/action-burst';
import { type BaseListenerOptions } from './types';

export interface KeyboardListenerOptions extends BaseListenerOptions {
    shouldMonitorVisibility: boolean;
    lastNavigationShortcutAtRef: React.MutableRefObject<number>;
    registerClipboardIncident: (clientActionAt?: string) => void;
}

export function useKeyboardListener(options: KeyboardListenerOptions) {
    const {
        configuration,
        examSessionId,
        isMonitoringSuspended,
        isMobile,
        emitTelemetryEvent,
        lockExam,
        shouldMonitorVisibility,
        lastNavigationShortcutAtRef,
        registerClipboardIncident,
    } = options;

    const lastPrintScreenIncidentAtRef = useRef(0);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (isMonitoringSuspended.current) return;

            if (shouldMonitorVisibility && event.key === 'Tab' && (event.altKey || event.metaKey)) {
                lastNavigationShortcutAtRef.current = Date.now();
            }

            if ((configuration?.webSecurity.clipboard_control ?? true) && !isMobile) {
                const normalizedKey = event.key.toLowerCase();
                if ((event.ctrlKey || event.metaKey) && ['c', 'x', 'v'].includes(normalizedKey)) {
                    event.preventDefault();
                    registerClipboardIncident(new Date().toISOString());
                    return;
                }
            }

            if (!(configuration?.webSecurity.print_screen_disable ?? true) || isMobile) return;

            const shortcutDetection = detectScreenCaptureShortcut({
                event,
                isMobile,
            });

            if (shortcutDetection.detected) {
                const clientActionAt = new Date().toISOString();
                const now = new Date(clientActionAt).getTime();

                const burstResult = evaluateActionBurst({
                    lastAcceptedAt: lastPrintScreenIncidentAtRef.current,
                    candidateAt: now,
                    windowMs: 800,
                });
                lastPrintScreenIncidentAtRef.current = burstResult.nextAcceptedAt;
                if (!burstResult.accepted) return;

                event.preventDefault();
                const metadata = createTelemetryActionMetadata({
                    eventType: 'PRINT_SCREEN_ATTEMPT',
                    examSessionId,
                    actionSource: 'screen-capture',
                    actionBucketId: 'screen-capture',
                    clientActionAt,
                    bucketMs: 800,
                });

                emitTelemetryEvent('PRINT_SCREEN_ATTEMPT', metadata);
                lockExam('screen-capture');
                toast.warning('A screen capture shortcut was detected for this exam.', {
                    description:
                        'This browser event was logged. Some operating-system capture shortcuts may still be intercepted before the page can observe them.',
                });
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [
        configuration?.webSecurity,
        examSessionId,
        isMobile,
        isMonitoringSuspended,
        emitTelemetryEvent,
        lockExam,
        registerClipboardIncident,
        shouldMonitorVisibility,
        lastNavigationShortcutAtRef,
    ]);
}
