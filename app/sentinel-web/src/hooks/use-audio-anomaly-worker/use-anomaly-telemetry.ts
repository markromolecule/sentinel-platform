import { useCallback } from 'react';
import { useApi } from '@sentinel/hooks';
import type { AudioWorkerPhase } from './_types';
import {
    DEFAULT_AUDIO_ANOMALY_CONFIG,
    TELEMETRY_EVENT_DEFINITIONS,
    type AudioAnomalySettings,
    type AudioAnomalyTypeValue,
} from '@sentinel/shared';
import { ingestTelemetryEvent } from '@sentinel/services';

const SILENCE_MIN_COOLDOWN_MS = 180_000;
const BACKGROUND_NOISE_MIN_COOLDOWN_MS = 60_000;

function toStableUuid(seed: string) {
    let hashA = 0x811c9dc5;
    let hashB = 0x811c9dc5;
    let hashC = 0x811c9dc5;
    let hashD = 0x811c9dc5;

    for (let index = 0; index < seed.length; index += 1) {
        const code = seed.charCodeAt(index);
        hashA = Math.imul(hashA ^ code, 0x01000193);
        hashB = Math.imul(hashB ^ (code + 17), 0x01000193);
        hashC = Math.imul(hashC ^ (code + 31), 0x01000193);
        hashD = Math.imul(hashD ^ (code + 47), 0x01000193);
    }

    const hex = [hashA, hashB, hashC, hashD]
        .map((part) => (part >>> 0).toString(16).padStart(8, '0'))
        .join('');

    return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        `4${hex.slice(13, 16)}`,
        `${((parseInt(hex.slice(16, 17), 16) & 0x3) | 0x8).toString(16)}${hex.slice(17, 20)}`,
        hex.slice(20, 32),
    ].join('-');
}

/**
 * Returns the effective cooldown for a reported audio anomaly type.
 *
 * @param anomalyType The accepted anomaly label selected for the current audio window.
 * @param cooldownMs The configured base cooldown for general audio anomalies.
 */
export function getAudioAnomalyCooldownMs(anomalyType: AudioAnomalyTypeValue, cooldownMs: number) {
    if (anomalyType === 'SILENCE_DETECTED') {
        return Math.max(cooldownMs, SILENCE_MIN_COOLDOWN_MS);
    }

    if (anomalyType === 'BACKGROUND_NOISE') {
        return Math.max(cooldownMs, BACKGROUND_NOISE_MIN_COOLDOWN_MS);
    }

    return cooldownMs;
}

/**
 * Builds stable action metadata for one accepted audio anomaly window.
 *
 * @param args Session, anomaly, and cooldown inputs used to bucket one accepted audio event.
 */
export function createAudioAnomalyActionMetadata(args: {
    examSessionId: string;
    anomalyType: AudioAnomalyTypeValue;
    clientActionAt?: string;
    cooldownMs: number;
}) {
    const clientActionAt = args.clientActionAt ?? new Date().toISOString();
    const effectiveCooldownMs = getAudioAnomalyCooldownMs(args.anomalyType, args.cooldownMs);
    const bucketStart = new Date(
        Math.floor(new Date(clientActionAt).getTime() / effectiveCooldownMs) * effectiveCooldownMs,
    ).toISOString();
    const dedupeKey = [args.examSessionId, 'AUDIO_ANOMALY', args.anomalyType, bucketStart].join(
        ':',
    );

    return {
        eventId: toStableUuid(dedupeKey),
        dedupeKey,
        clientActionAt,
    };
}

function createAudioConfigVersion(runtimeConfig?: AudioAnomalySettings | null) {
    if (!runtimeConfig) {
        return 'audio-config:default';
    }

    const stableSeed = JSON.stringify({
        enabledAnomalyTypes: [...runtimeConfig.enabledAnomalyTypes].sort(),
        thresholds: runtimeConfig.thresholds,
        cooldownMs: runtimeConfig.cooldownMs,
        consecutiveFrameThreshold: runtimeConfig.consecutiveFrameThreshold,
        sensitivityMultiplier: runtimeConfig.sensitivityMultiplier,
    });

    return `audio-config:${toStableUuid(stableSeed)}`;
}

function getAudioStreamPhase(audioStream?: MediaStream | null) {
    if (!audioStream) {
        return 'managed' as const;
    }

    const tracks = audioStream.getAudioTracks?.() ?? audioStream.getTracks?.() ?? [];

    if (!tracks.length) {
        return 'unavailable' as const;
    }

    return tracks.some((track) => track.readyState === 'live')
        ? ('live' as const)
        : ('ended' as const);
}

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
    cooldownMs = 10_000,
    runtimeConfigRef?: React.RefObject<AudioAnomalySettings | null | undefined>,
    workerPhaseRef?: React.RefObject<AudioWorkerPhase>,
    audioStreamRef?: React.RefObject<MediaStream | null | undefined>,
) {
    return useCallback(
        async (
            anomalyType: AudioAnomalyTypeValue,
            confidenceScore: number,
            clientActionAt = new Date().toISOString(),
        ) => {
            if (!examSessionId || !studentId || isSuspendedRef?.current) {
                return;
            }

            const runtimeConfig = runtimeConfigRef?.current;
            const workerPhase = workerPhaseRef?.current ?? 'idle';
            const audioStream = audioStreamRef?.current;

            const eventDefinition = TELEMETRY_EVENT_DEFINITIONS.AUDIO_ANOMALY;
            const actionMetadata = createAudioAnomalyActionMetadata({
                examSessionId,
                anomalyType,
                clientActionAt,
                cooldownMs,
            });

            await ingestTelemetryEvent(apiClient, {
                examSessionId,
                studentId,
                timestamp: clientActionAt,
                eventType: 'AUDIO_ANOMALY',
                platform: 'WEB',
                source: eventDefinition.source,
                ruleKey: eventDefinition.ruleKey,
                metadata: {
                    ...actionMetadata,
                    confidenceScore,
                    anomalyType,
                    audioDiagnostics: {
                        threshold:
                            runtimeConfig?.thresholds[anomalyType] ??
                            DEFAULT_AUDIO_ANOMALY_CONFIG.thresholds[anomalyType],
                        configVersion: createAudioConfigVersion(runtimeConfig),
                        workerPhase: workerPhase === 'warning' ? 'initializing' : workerPhase,
                        streamPhase: getAudioStreamPhase(audioStream),
                    },
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
        [
            apiClient,
            cooldownMs,
            examSessionId,
            isSuspendedRef,
            runtimeConfigRef,
            studentId,
            workerPhaseRef,
            audioStreamRef,
        ],
    );
}
