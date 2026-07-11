import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { createTelemetryActionMetadata } from '../../../_lib/web-telemetry-client';
import { evaluateActionBurst } from '../../../_lib/web-telemetry-client/_utils/action-burst';
import { type AttemptMonitoringPhase } from '../_types';
import { type BaseListenerOptions } from './types';

export interface FullscreenListenerOptions extends BaseListenerOptions {
    shouldMonitorFullscreen: boolean;
    monitoringPhase?: React.MutableRefObject<AttemptMonitoringPhase>;
}

export function useFullscreenListener(options: FullscreenListenerOptions) {
    const {
        examSessionId,
        isMonitoringSuspended,
        emitTelemetryEvent,
        lockExam,
        shouldMonitorFullscreen,
        monitoringPhase,
    } = options;

    const lastFullscreenIncidentAtRef = useRef(0);

    useEffect(() => {
        const isSubmitTeardown = (phase: AttemptMonitoringPhase | undefined) =>
            phase === 'submitting' || phase === 'navigating-to-turn-in' || phase === 'suspended';

        const handleFullscreenChange = () => {
            const currentPhase = monitoringPhase?.current;
            if (
                isMonitoringSuspended.current ||
                !shouldMonitorFullscreen ||
                document.fullscreenElement ||
                isSubmitTeardown(currentPhase)
            ) {
                return;
            }

            const clientActionAt = new Date().toISOString();
            const now = new Date(clientActionAt).getTime();

            const burstResult = evaluateActionBurst({
                lastAcceptedAt: lastFullscreenIncidentAtRef.current,
                candidateAt: now,
                windowMs: 1000,
            });
            lastFullscreenIncidentAtRef.current = burstResult.nextAcceptedAt;
            if (!burstResult.accepted) return;

            const metadata = createTelemetryActionMetadata({
                eventType: 'FULL_SCREEN_EXIT',
                examSessionId,
                actionSource: 'fullscreen-change',
                actionBucketId: 'fullscreen-exit',
                clientActionAt,
                bucketMs: 1000,
            });

            emitTelemetryEvent('FULL_SCREEN_EXIT', metadata);
            lockExam('fullscreen-exit');
            toast.warning('Fullscreen is required for this exam.', {
                description: 'Return to fullscreen to continue under the configured policy.',
            });
        };

        if (shouldMonitorFullscreen && !isMonitoringSuspended.current) {
            document.documentElement.requestFullscreen?.()?.catch(() => null);
        }

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [
        shouldMonitorFullscreen,
        emitTelemetryEvent,
        lockExam,
        isMonitoringSuspended,
        monitoringPhase,
        examSessionId,
    ]);
}
