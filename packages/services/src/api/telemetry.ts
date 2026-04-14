import type {
    TelemetryEventType,
    TelemetryPlatform,
    TelemetryRuleKey,
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
