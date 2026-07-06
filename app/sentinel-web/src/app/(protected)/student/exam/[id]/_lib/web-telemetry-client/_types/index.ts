import type {
    WEB_TELEMETRY_EVENT_TYPES,
    MEDIAPIPE_SUPPORTED_EVENT_TYPES,
    ExamConfig,
    TelemetrySettings,
} from '@sentinel/shared';
import type { TelemetryMetadata, TelemetrySessionContext } from '@sentinel/services';

export type WebTelemetryEventType = (typeof WEB_TELEMETRY_EVENT_TYPES)[number];
export type MediaPipeTelemetryEventType = (typeof MEDIAPIPE_SUPPORTED_EVENT_TYPES)[number];

export type WebTelemetryRuleEnabledReader = (configuration: ExamConfig) => boolean;

export type BuildWebTelemetryPayloadArgs = {
    examSessionId: string;
    studentId: string;
    eventType: WebTelemetryEventType;
    timestamp?: string;
    metadata?: TelemetryMetadata;
    sessionContext?: TelemetrySessionContext;
    eventId?: string;
    dedupeKey?: string;
    clientActionAt?: string;
};

export type EmitWebTelemetryEventArgs = BuildWebTelemetryPayloadArgs & {
    configuration?: ExamConfig;
};

export type BuildMediaPipeTelemetryPayloadArgs = {
    examSessionId: string;
    studentId: string;
    eventType: MediaPipeTelemetryEventType;
    timestamp?: string;
    metadata?: TelemetryMetadata;
    sessionContext?: TelemetrySessionContext;
};

export type EmitMediaPipeTelemetryEventArgs = BuildMediaPipeTelemetryPayloadArgs & {
    configuration?: ExamConfig;
    mediaPipeSandbox?: TelemetrySettings['mediaPipeSandbox'];
};
