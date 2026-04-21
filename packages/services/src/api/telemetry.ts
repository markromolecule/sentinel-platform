import type {
    TelemetryEventType,
    TelemetryPlatform,
    TelemetryRuleKey,
    TelemetrySettings,
    TelemetrySettingsRecord,
    TelemetrySource,
} from '@sentinel/shared';
import type { ApiClientType } from '../api-client';

export type TelemetryMetadata = {
    durationMs?: number;
    confidenceScore?: number;
};

export type TelemetrySessionContext = {
    browser?: string;
    os?: string;
    deviceType?: 'DESKTOP' | 'TABLET' | 'MOBILE';
    appVersion?: string;
    clientVersion?: string;
    clientCapabilities?: string[];
};

export type IngestTelemetryEventPayload = {
    examSessionId: string;
    studentId: string;
    timestamp: string;
    platform: TelemetryPlatform;
    source: TelemetrySource;
    ruleKey: TelemetryRuleKey;
    eventType: TelemetryEventType;
    metadata?: TelemetryMetadata;
    sessionContext?: TelemetrySessionContext;
};

export type TelemetryHealthSnapshot = {
    status: string;
    timestamp: string;
    ingestion: {
        mode: string;
        queueName: string | null;
        bufferName?: string | null;
        waiting?: number;
        active?: number;
        failed?: number;
        completed?: number;
        buffered?: number;
    };
};

export async function ingestTelemetryEvent(
    apiClient: ApiClientType,
    payload: IngestTelemetryEventPayload,
): Promise<void> {
    await apiClient('/telemetry/events', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
}

interface ApiResponse<T> {
    message: string;
    data: T;
}

export async function getTelemetrySettings(
    apiClient: ApiClientType,
): Promise<TelemetrySettingsRecord> {
    const response: ApiResponse<TelemetrySettingsRecord> = await apiClient('/telemetry/settings');
    return response.data;
}

export async function updateTelemetrySettings(
    apiClient: ApiClientType,
    payload: TelemetrySettings,
): Promise<TelemetrySettingsRecord> {
    const response: ApiResponse<TelemetrySettingsRecord> = await apiClient('/telemetry/settings', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    return response.data;
}

export async function getTelemetryHealth(
    apiClient: ApiClientType,
): Promise<TelemetryHealthSnapshot> {
    return apiClient('/telemetry/health');
}
