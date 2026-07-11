import type {
    TelemetryIncidentRecord,
    TelemetryIncidentStatus,
    TelemetryEventIngestionRequest,
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
    aggregation?: {
        trigger: 'immediate' | 'duration-threshold' | 'repeat-threshold' | 'confidence-threshold';
        occurrenceCount?: number;
        windowSeconds?: number;
        threshold?: number;
    };
};

export type TelemetrySessionContext = {
    browser?: string;
    os?: string;
    deviceType?: 'DESKTOP' | 'TABLET' | 'MOBILE';
    appVersion?: string;
    clientVersion?: string;
    clientCapabilities?: string[];
};

export type IngestTelemetryEventPayload = TelemetryEventIngestionRequest & {
    examSessionId: string;
    studentId: string;
    timestamp: string;
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

export type GetTelemetryIncidentsParams = {
    attemptId?: string;
    examId?: string;
    studentId?: string;
    institutionId?: string;
    platform?: TelemetryPlatform;
    source?: TelemetrySource;
    ruleKey?: TelemetryRuleKey;
    incidentType?: 'AUDIO_DETECTED';
    status?: TelemetryIncidentStatus;
    limit?: number;
};

export type UpdateTelemetryIncidentPayload = {
    incidentId: string;
    status?: TelemetryIncidentStatus;
    evidenceUrl?: string | null;
    reviewNotes?: string | null;
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

function buildTelemetryIncidentQueryString(params: GetTelemetryIncidentsParams = {}) {
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null || value === '') {
            continue;
        }

        searchParams.set(key, String(value));
    }

    const queryString = searchParams.toString();

    return queryString ? `?${queryString}` : '';
}

export async function getTelemetryIncidents(
    apiClient: ApiClientType,
    params: GetTelemetryIncidentsParams = {},
): Promise<TelemetryIncidentRecord[]> {
    const response: ApiResponse<TelemetryIncidentRecord[]> = await apiClient(
        `/telemetry/incidents${buildTelemetryIncidentQueryString(params)}`,
    );

    return response.data;
}

export async function updateTelemetryIncident(
    apiClient: ApiClientType,
    payload: UpdateTelemetryIncidentPayload,
): Promise<TelemetryIncidentRecord> {
    const { incidentId, ...body } = payload;
    const response: ApiResponse<TelemetryIncidentRecord> = await apiClient(
        `/telemetry/incidents/${incidentId}`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        },
    );

    return response.data;
}
