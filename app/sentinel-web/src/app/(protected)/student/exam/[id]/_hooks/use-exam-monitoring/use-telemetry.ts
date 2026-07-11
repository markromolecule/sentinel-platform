import { useCallback } from 'react';
import { useApi } from '@sentinel/hooks';
import type { ExamConfig } from '@sentinel/shared/types';
import {
    emitWebTelemetryEvent,
    writeMonitoringEventTrace,
    type TelemetryActionMetadata,
    type BrowserTelemetryEventType,
} from '../../_lib/web-telemetry-client';

export function useTelemetry(args: {
    configuration?: ExamConfig;
    examSessionId?: string;
    studentId?: string;
    isMonitoringSuspended: React.MutableRefObject<boolean>;
    isMobile: boolean;
}) {
    const { configuration, examSessionId, studentId, isMonitoringSuspended, isMobile } = args;
    const apiClient = useApi();

    const emitTelemetryEvent = useCallback(
        (
            eventType: BrowserTelemetryEventType,
            metadataOptions?: TelemetryActionMetadata,
        ) => {
            const requestedPlatform = isMobile ? 'MOBILE' : 'WEB';
            const shouldSkipEmission = isMonitoringSuspended.current || !examSessionId || !studentId;
            const detectionTime = metadataOptions?.detectionTimestamp ?? metadataOptions?.clientActionAt ?? new Date().toISOString();
            const emissionTime = new Date().toISOString();
            const traceBase = {
                detectorSource: metadataOptions?.detectorSource ?? 'browser',
                eventType,
                eventSubtype: metadataOptions?.eventSubtype,
                eventId: metadataOptions?.eventId,
                dedupeKey: metadataOptions?.dedupeKey,
                detectionTime,
            } as const;

            if (shouldSkipEmission) {
                writeMonitoringEventTrace({
                    ...traceBase,
                    emissionTime,
                    disposition: 'suppressed',
                    reason: isMonitoringSuspended.current
                        ? 'monitoring-suspended'
                        : !examSessionId || !studentId
                            ? 'missing-session-context'
                            : 'rule-disabled',
                });
                return;
            }

            writeMonitoringEventTrace({
                ...traceBase,
                emissionTime,
                disposition: 'emitting',
            });

            void emitWebTelemetryEvent(apiClient, {
                configuration,
                examSessionId,
                studentId,
                eventType,
                platform: requestedPlatform,
                eventId: metadataOptions?.eventId,
                dedupeKey: metadataOptions?.dedupeKey,
                clientActionAt: metadataOptions?.clientActionAt,
            })
                .then((emitted) => {
                    writeMonitoringEventTrace({
                        ...traceBase,
                        emissionTime,
                        disposition: emitted ? 'accepted' : 'suppressed',
                        reason: emitted ? undefined : 'rule-disabled',
                    });
                })
                .catch((error: unknown) => {
                    writeMonitoringEventTrace({
                        ...traceBase,
                        emissionTime,
                        disposition: 'failed',
                        reason: error instanceof Error ? error.message : 'unknown-error',
                    });
                    console.error('Failed to emit web telemetry event.', {
                        eventType,
                        error,
                    });
                });
        },
        [apiClient, configuration, examSessionId, isMobile, studentId, isMonitoringSuspended],
    );

    return { emitTelemetryEvent };
}
