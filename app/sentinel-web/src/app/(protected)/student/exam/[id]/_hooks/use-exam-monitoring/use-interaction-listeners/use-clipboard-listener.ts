import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { createTelemetryActionMetadata } from '../../../_lib/web-telemetry-client';
import { evaluateActionBurst } from '../../../_lib/web-telemetry-client/_utils/action-burst';
import { type BaseListenerOptions } from './types';

export function useClipboardListener(options: BaseListenerOptions) {
    const {
        configuration,
        examSessionId,
        isMonitoringSuspended,
        isMobile,
        emitTelemetryEvent,
    } = options;

    const lastClipboardIncidentAtRef = useRef(0);

    const registerClipboardIncident = useCallback(
        (clientActionAt = new Date().toISOString()) => {
            if (isMonitoringSuspended.current) return;
            const now = new Date(clientActionAt).getTime();
            
            const burstResult = evaluateActionBurst({
                lastAcceptedAt: lastClipboardIncidentAtRef.current,
                candidateAt: now,
                windowMs: 800,
            });
            lastClipboardIncidentAtRef.current = burstResult.nextAcceptedAt;
            if (!burstResult.accepted) return;

            const metadata = createTelemetryActionMetadata({
                eventType: 'CLIPBOARD_ATTEMPT',
                examSessionId,
                actionSource: 'clipboard-shortcut',
                actionBucketId: 'clipboard',
                clientActionAt,
                bucketMs: 800,
            });
            
            emitTelemetryEvent('CLIPBOARD_ATTEMPT', metadata);
            toast.warning('Clipboard actions are disabled for this exam.');
        },
        [emitTelemetryEvent, examSessionId, isMonitoringSuspended],
    );

    useEffect(() => {
        const blockClipboard = (e: ClipboardEvent) => {
            if (
                !isMonitoringSuspended.current &&
                (configuration?.webSecurity.clipboard_control ?? true) &&
                !isMobile
            ) {
                const clientActionAt = new Date().toISOString();
                e.preventDefault();
                registerClipboardIncident(clientActionAt);
            }
        };

        document.addEventListener('copy', blockClipboard);
        document.addEventListener('cut', blockClipboard);
        document.addEventListener('paste', blockClipboard);

        return () => {
            document.removeEventListener('copy', blockClipboard);
            document.removeEventListener('cut', blockClipboard);
            document.removeEventListener('paste', blockClipboard);
        };
    }, [configuration?.webSecurity, isMobile, isMonitoringSuspended, registerClipboardIncident]);

    return { registerClipboardIncident };
}
