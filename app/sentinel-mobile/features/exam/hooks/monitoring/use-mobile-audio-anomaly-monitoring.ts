import { useState, useCallback, useMemo, useRef } from 'react';
import { useAudioSettingsQuery } from '@sentinel/hooks';
import {
    DEFAULT_AUDIO_ANOMALY_CONFIG,
    type AudioAnomalyConfig,
} from '@sentinel/shared';
import type { ExamConfiguration } from '@sentinel/shared/types';
import type { ApiClientType } from '@sentinel/services';
import {
    emitMobileTelemetryEvent,
    createMobileAudioAnomalyMetadata,
    toStableUuid,
} from '@/features/exam/lib/mobile-telemetry-client';
import type {
    AudioBridgeError,
    AudioBridgeStatus,
    QualifiedAudioAnomaly,
} from '@/features/exam/components/monitoring';

export type UseMobileAudioAnomalyMonitoringArgs = {
    examId?: string;
    apiClient?: ApiClientType;
    configuration?: ExamConfiguration;
    examSessionId?: string;
    studentId?: string;
    onAnomalyDetected?: (anomaly: QualifiedAudioAnomaly) => void | Promise<void>;
    customConfig?: Partial<AudioAnomalyConfig>;
};

export type UseMobileAudioAnomalyMonitoringResult = {
    isEnabled: boolean;
    isMonitoring: boolean;
    bridgeStatus: AudioBridgeStatus;
    error: AudioBridgeError | null;
    effectiveConfig: AudioAnomalyConfig;
    isSettingsLoading: boolean;
    handleStatusChange: (status: AudioBridgeStatus) => void;
    handleError: (error: AudioBridgeError) => void;
    handleAnomalyDetected: (anomaly: QualifiedAudioAnomaly) => void;
};

/**
 * Custom React hook that manages the lifecycle, calibration, enablement gating,
 * and qualified anomaly events for mobile active-session audio monitoring.
 *
 * It enforces:
 * 1. Mounting and running only when the active attempt has audio_anomaly_detection enabled,
 *    microphone requirements permit it, and an authenticated session/student exists.
 * 2. Shared calibration from `useAudioSettingsQuery` with fallback to `DEFAULT_AUDIO_ANOMALY_CONFIG`.
 * 3. Graceful failure: errors (such as mic permission denied or model load failure)
 *    are captured without halting or blocking the student's exam taking experience.
 * 4. Zero raw audio transmission: only qualified anomaly labels and confidence scores are handled.
 */
export function useMobileAudioAnomalyMonitoring({
    apiClient,
    configuration,
    examSessionId,
    studentId,
    onAnomalyDetected,
    customConfig,
}: UseMobileAudioAnomalyMonitoringArgs): UseMobileAudioAnomalyMonitoringResult {
    const [bridgeStatus, setBridgeStatus] = useState<AudioBridgeStatus>('idle');
    const [error, setError] = useState<AudioBridgeError | null>(null);

    const onAnomalyDetectedRef = useRef(onAnomalyDetected);
    onAnomalyDetectedRef.current = onAnomalyDetected;

    // Enablement gate: rule must not be explicitly disabled, mic must not be disallowed,
    // and both session ID and student ID must exist.
    const isRuleEnabled = configuration?.aiRules?.audio_anomaly_detection !== false;
    const isMicrophonePermitted = configuration?.micRequired !== false;
    const hasValidSession = Boolean(examSessionId && studentId);
    const isEnabled = Boolean(isRuleEnabled && isMicrophonePermitted && hasValidSession);

    // Fetch shared calibration settings
    const { data: audioSettingsRecord, isLoading: isSettingsLoading } = useAudioSettingsQuery();

    const effectiveConfig = useMemo<AudioAnomalyConfig>(() => {
        const serverConfig = audioSettingsRecord?.value;

        return {
            sensitivityMultiplier:
                customConfig?.sensitivityMultiplier ??
                serverConfig?.sensitivityMultiplier ??
                DEFAULT_AUDIO_ANOMALY_CONFIG.sensitivityMultiplier,
            consecutiveFrameThreshold:
                customConfig?.consecutiveFrameThreshold ??
                serverConfig?.consecutiveFrameThreshold ??
                DEFAULT_AUDIO_ANOMALY_CONFIG.consecutiveFrameThreshold,
            cooldownMs:
                customConfig?.cooldownMs ??
                serverConfig?.cooldownMs ??
                DEFAULT_AUDIO_ANOMALY_CONFIG.cooldownMs,
            thresholds: {
                ...DEFAULT_AUDIO_ANOMALY_CONFIG.thresholds,
                ...(serverConfig?.thresholds ?? {}),
                ...(customConfig?.thresholds ?? {}),
            },
            enabledAnomalyTypes:
                customConfig?.enabledAnomalyTypes ??
                serverConfig?.enabledAnomalyTypes ??
                DEFAULT_AUDIO_ANOMALY_CONFIG.enabledAnomalyTypes,
        };
    }, [audioSettingsRecord, customConfig]);

    const handleStatusChange = useCallback((status: AudioBridgeStatus) => {
        setBridgeStatus(status);
        if (status === 'running' || status === 'ready') {
            setError(null);
        }
    }, []);

    const handleError = useCallback((bridgeError: AudioBridgeError) => {
        setError(bridgeError);
        setBridgeStatus('error');
    }, []);

    const handleAnomalyDetected = useCallback(
        (anomaly: QualifiedAudioAnomaly) => {
            if (isEnabled && examSessionId && studentId) {
                const clientActionAt = new Date(anomaly.detectedAt).toISOString();
                const anomalyMetadata = createMobileAudioAnomalyMetadata({
                    examSessionId,
                    anomalyType: anomaly.anomalyType,
                    confidenceScore: anomaly.confidenceScore,
                    cooldownMs: effectiveConfig.cooldownMs,
                    clientActionAt,
                    threshold: effectiveConfig.thresholds[anomaly.anomalyType],
                    configVersion: `audio-config:${toStableUuid(JSON.stringify(effectiveConfig))}`,
                });

                void emitMobileTelemetryEvent({
                    apiClient,
                    configuration,
                    examSessionId,
                    studentId,
                    eventType: 'AUDIO_ANOMALY',
                    metadata: anomalyMetadata,
                }).catch((err) => {
                    console.error('Failed to emit mobile audio anomaly telemetry event', err);
                });
            }

            onAnomalyDetectedRef.current?.(anomaly);
        },
        [apiClient, configuration, effectiveConfig, examSessionId, isEnabled, studentId],
    );

    const isMonitoring = Boolean(isEnabled && bridgeStatus === 'running');

    return {
        isEnabled,
        isMonitoring,
        bridgeStatus,
        error,
        effectiveConfig,
        isSettingsLoading,
        handleStatusChange,
        handleError,
        handleAnomalyDetected,
    };
}
