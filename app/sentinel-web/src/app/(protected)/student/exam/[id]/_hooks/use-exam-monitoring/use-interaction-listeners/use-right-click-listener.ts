import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { createTelemetryActionMetadata } from '../../../_lib/web-telemetry-client';
import { evaluateActionBurst } from '../../../_lib/web-telemetry-client/_utils/action-burst';
import { type BaseListenerOptions } from './types';

export function useRightClickListener(options: BaseListenerOptions) {
    const {
        configuration,
        examSessionId,
        isMonitoringSuspended,
        isMobile,
        emitTelemetryEvent,
        lockExam,
    } = options;

    const lastRightClickIncidentAtRef = useRef(0);

    useEffect(() => {
        const blockContextMenu = (e: MouseEvent) => {
            if (
                !isMonitoringSuspended.current &&
                (configuration?.webSecurity.right_click_disable ?? true) &&
                !isMobile
            ) {
                const clientActionAt = new Date().toISOString();
                const now = new Date(clientActionAt).getTime();
                e.preventDefault();
                
                const burstResult = evaluateActionBurst({
                    lastAcceptedAt: lastRightClickIncidentAtRef.current,
                    candidateAt: now,
                    windowMs: 800,
                });
                lastRightClickIncidentAtRef.current = burstResult.nextAcceptedAt;
                if (!burstResult.accepted) return;

                const metadata = createTelemetryActionMetadata({
                    eventType: 'RIGHT_CLICK_ATTEMPT',
                    examSessionId,
                    actionSource: 'contextmenu',
                    actionBucketId: 'right-click',
                    clientActionAt,
                    bucketMs: 800,
                });
                
                emitTelemetryEvent('RIGHT_CLICK_ATTEMPT', metadata);
                lockExam('right-click');
                toast.warning('Right-click actions are disabled for this exam.', {
                    description: 'The attempt remains secured while this event is logged.',
                });
            }
        };

        document.addEventListener('contextmenu', blockContextMenu);

        return () => {
            document.removeEventListener('contextmenu', blockContextMenu);
        };
    }, [
        configuration?.webSecurity,
        examSessionId,
        isMobile,
        isMonitoringSuspended,
        emitTelemetryEvent,
        lockExam,
    ]);
}
