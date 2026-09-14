import Constants from 'expo-constants';
import { Platform } from 'react-native';
import {
    MOBILE_TELEMETRY_EVENT_TYPES,
    SHARED_TELEMETRY_EVENT_TYPES,
    TELEMETRY_EVENT_DEFINITIONS,
    type TelemetryEventType,
    type TelemetryMetadata,
    type TelemetrySessionContext,
} from '@sentinel/shared/schema';
import type { ExamConfiguration } from '@sentinel/shared/types';
import type { AudioAnomalyType } from '@sentinel/shared';
import { ingestTelemetryEvent, type ApiClientType, type IngestTelemetryEventPayload } from '@sentinel/services';
import { getApiBaseUrl } from '@/lib/config/api-config';

export type MobileTelemetryEventType =
    (typeof MOBILE_TELEMETRY_EVENT_TYPES)[number] | (typeof SHARED_TELEMETRY_EVENT_TYPES)[number];

export type MobileTelemetryMetadata = TelemetryMetadata;

export type MobileTelemetrySessionContext = TelemetrySessionContext;

export type MobileTelemetryPayload = Omit<
    IngestTelemetryEventPayload,
    'platform' | 'eventType' | 'metadata' | 'sessionContext'
> & {
    platform: 'MOBILE';
    eventType: MobileTelemetryEventType;
    metadata?: MobileTelemetryMetadata;
    sessionContext?: MobileTelemetrySessionContext;
};

export type EmitMobileTelemetryEventArgs = {
    apiClient?: ApiClientType;
    configuration?: ExamConfiguration;
    examSessionId: string;
    eventType: MobileTelemetryEventType;
    studentId?: string;
    metadata?: MobileTelemetryMetadata;
};

type MobileTelemetryRuleEnabledReader = (configuration: ExamConfiguration) => boolean;

const MOBILE_TELEMETRY_RULE_ENABLED_READERS: Record<
    MobileTelemetryEventType,
    MobileTelemetryRuleEnabledReader
> = {
    APP_BACKGROUNDING: (configuration) => configuration.mobileSecurity.prevent_backgrounding,
    SCREENSHOT_ATTEMPT: (configuration) => configuration.mobileSecurity.screenshot_block,
    ROOT_JAILBREAK_DETECTED: (configuration) =>
        configuration.mobileSecurity.root_jailbreak_detection,
    APP_PINNING_VIOLATION: (configuration) => configuration.mobileSecurity.app_pinning_required,
    NOTIFICATION_BLOCK_VIOLATION: (configuration) =>
        configuration.mobileSecurity.notification_block,
    GAZE_OFF_SCREEN: (configuration) => configuration.aiRules.gaze_tracking ?? true,
    MULTIPLE_FACES: (configuration) => configuration.aiRules.multiple_faces_detection ?? true,
    NO_FACE_DETECTED: (configuration) => configuration.aiRules.face_detection ?? true,
    AUDIO_ANOMALY: (configuration) => configuration.aiRules.audio_anomaly_detection ?? true,
};

export function isMobileTelemetryEventEnabled(
    configuration: ExamConfiguration | undefined,
    eventType: MobileTelemetryEventType,
) {
    if (!configuration) {
        return false;
    }

    return MOBILE_TELEMETRY_RULE_ENABLED_READERS[eventType](configuration);
}

export function buildMobileTelemetrySessionContext(
    extraCapabilities: string[] = [],
): MobileTelemetrySessionContext {
    const appVersion =
        Constants.expoConfig?.version ??
        (typeof Constants.nativeAppVersion === 'string' ? Constants.nativeAppVersion : undefined);

    return {
        os: `${Platform.OS} ${String(Platform.Version)}`,
        deviceType: 'MOBILE',
        appVersion,
        clientVersion: appVersion,
        clientCapabilities: ['appstate-monitor', 'notification-blur-monitor', ...extraCapabilities],
    };
}

export function buildMobileTelemetryPayload({
    examSessionId,
    eventType,
    studentId,
    metadata,
}: {
    examSessionId: string;
    eventType: MobileTelemetryEventType;
    studentId: string;
    metadata?: MobileTelemetryMetadata;
}): MobileTelemetryPayload {
    const eventDefinition = TELEMETRY_EVENT_DEFINITIONS[eventType];

    return {
        examSessionId,
        studentId,
        timestamp: new Date().toISOString(),
        platform: 'MOBILE',
        source: eventDefinition.source,
        ruleKey: eventDefinition.ruleKey,
        eventType,
        metadata,
        sessionContext: buildMobileTelemetrySessionContext(),
    };
}

export async function emitMobileTelemetryEvent({
    apiClient,
    configuration,
    examSessionId,
    eventType,
    studentId,
    metadata,
}: EmitMobileTelemetryEventArgs) {
    if (!isMobileTelemetryEventEnabled(configuration, eventType)) {
        return false;
    }

    const resolvedBaseUrl = getApiBaseUrl();

    if (!studentId || !examSessionId) {
        console.info(
            'Skipping mobile telemetry delivery because the authenticated mobile attempt identity is incomplete.',
            {
                eventType,
                hasApiBaseUrl: Boolean(apiClient || resolvedBaseUrl),
                hasStudentId: Boolean(studentId),
                hasExamSessionId: Boolean(examSessionId),
            },
        );
        return false;
    }

    const payload = buildMobileTelemetryPayload({
        examSessionId,
        eventType,
        studentId,
        metadata,
    });

    if (apiClient) {
        await ingestTelemetryEvent(apiClient, payload);
        return true;
    }

    const apiBaseUrl = resolvedBaseUrl;
    const bearerToken = process.env.EXPO_PUBLIC_API_BEARER_TOKEN?.trim();

    if (!apiBaseUrl) {
        console.info(
            'Skipping mobile telemetry delivery because the mobile API identity is not configured.',
            {
                eventType,
                hasApiBaseUrl: false,
                hasStudentId: true,
            },
        );
        return false;
    }

    const response = await fetch(`${apiBaseUrl}/telemetry/events`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`Failed to deliver mobile telemetry event: ${response.status}`);
    }

    return true;
}

const SILENCE_MIN_COOLDOWN_MS = 180_000;
const BACKGROUND_NOISE_MIN_COOLDOWN_MS = 60_000;

/**
 * Produces a deterministic UUID-v4-like string from a seed string.
 */
export function toStableUuid(seed: string): string {
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
 * Returns the effective cooldown for an audio anomaly type.
 */
export function getAudioAnomalyCooldownMs(anomalyType: AudioAnomalyType, cooldownMs: number): number {
    if (anomalyType === 'SILENCE_DETECTED') {
        return Math.max(cooldownMs, SILENCE_MIN_COOLDOWN_MS);
    }

    if (anomalyType === 'BACKGROUND_NOISE') {
        return Math.max(cooldownMs, BACKGROUND_NOISE_MIN_COOLDOWN_MS);
    }

    return cooldownMs;
}

export interface CreateMobileAudioAnomalyMetadataArgs {
    examSessionId: string;
    anomalyType: AudioAnomalyType;
    confidenceScore?: number;
    cooldownMs: number;
    clientActionAt?: string;
    threshold?: number;
    configVersion?: string;
}

/**
 * Constructs the typed telemetry metadata payload for mobile audio anomaly events,
 * including deterministic dedupeKey and eventId.
 */
export function createMobileAudioAnomalyMetadata(
    args: CreateMobileAudioAnomalyMetadataArgs,
): MobileTelemetryMetadata {
    const clientActionAt = args.clientActionAt ?? new Date().toISOString();
    const effectiveCooldownMs = getAudioAnomalyCooldownMs(args.anomalyType, args.cooldownMs);
    const bucketStart = new Date(
        Math.floor(new Date(clientActionAt).getTime() / effectiveCooldownMs) * effectiveCooldownMs,
    ).toISOString();
    const dedupeKey = [args.examSessionId, 'AUDIO_ANOMALY', args.anomalyType, bucketStart].join(':');

    return {
        anomalyType: args.anomalyType,
        confidenceScore: args.confidenceScore,
        dedupeKey,
        eventId: toStableUuid(dedupeKey),
        clientActionAt,
        audioDiagnostics: {
            threshold: args.threshold,
            configVersion: args.configVersion ?? 'audio-config:default',
            workerPhase: 'running',
            streamPhase: 'live',
        },
    };
}
