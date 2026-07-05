import { useCallback } from 'react';
import { useApi } from '@sentinel/hooks';
import { TELEMETRY_EVENT_DEFINITIONS, type AudioAnomalyTypeValue } from '@sentinel/shared';
import { ingestTelemetryEvent } from '@sentinel/services';

/**
 * Custom hook to encapsulate audio anomaly telemetry reporting.
 *
 * @param apiClient API client instance from useApi
 * @param examSessionId The active exam session ID
 * @param studentId The active student ID
 * @param isSuspendedRef Ref indicating if monitoring is currently suspended
 */
export function useAnomalyTelemetry(
    apiClient: ReturnType<typeof useApi>,
    examSessionId?: string,
    studentId?: string,
    isSuspendedRef?: React.RefObject<boolean>,
) {
    return useCallback(
        async (anomalyType: AudioAnomalyTypeValue, confidenceScore: number) => {
            if (!examSessionId || !studentId || isSuspendedRef?.current) {
                return;
            }

            const eventDefinition = TELEMETRY_EVENT_DEFINITIONS.AUDIO_ANOMALY;
            await ingestTelemetryEvent(apiClient, {
                examSessionId,
                studentId,
                timestamp: new Date().toISOString(),
                eventType: 'AUDIO_ANOMALY',
                platform: 'WEB',
                source: eventDefinition.source,
                ruleKey: eventDefinition.ruleKey,
                metadata: {
                    confidenceScore,
                    anomalyType,
                    aggregation: {
                        trigger:
                            anomalyType === 'SILENCE_DETECTED'
                                ? 'duration-threshold'
                                : 'confidence-threshold',
                        threshold: confidenceScore,
                    },
                },
            });
        },
        [apiClient, examSessionId, studentId, isSuspendedRef],
    );
}
