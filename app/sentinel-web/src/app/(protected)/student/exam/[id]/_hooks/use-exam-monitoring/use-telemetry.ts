import { useCallback } from 'react';
import { useApi } from '@sentinel/hooks';
import type { ExamConfig } from '@sentinel/shared/types';
import {
    emitWebTelemetryEvent,
    type WebTelemetryEventType,
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
            eventType: WebTelemetryEventType,
            metadataOptions?: {
                eventId?: string;
                dedupeKey?: string;
                clientActionAt?: string;
            },
        ) => {
            const shouldSkipEmission =
                isMonitoringSuspended.current || !examSessionId || !studentId || isMobile;

            if (shouldSkipEmission) {
                return;
            }

            const actionMetadata = metadataOptions;

            void emitWebTelemetryEvent(apiClient, {
                configuration,
                examSessionId,
                studentId,
                eventType,
                eventId: actionMetadata?.eventId,
                dedupeKey: actionMetadata?.dedupeKey,
                clientActionAt: actionMetadata?.clientActionAt,
            }).catch((error: unknown) => {
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
