import {
    TELEMETRY_EVENT_DEFINITIONS,
    type TelemetryPlatform,
} from '../schema';
import type {
    MediaPipeSupportedEventType,
    MediaPipeTelemetryMetadata,
    MediaPipeTelemetryPayload,
    MediaPipeTelemetrySessionContext,
} from './types';

type BuildMediaPipeTelemetryPayloadArgs = {
    examSessionId: string;
    studentId: string;
    eventType: MediaPipeSupportedEventType;
    timestamp?: string;
    metadata?: MediaPipeTelemetryMetadata;
    sessionContext?: MediaPipeTelemetrySessionContext;
    platform?: TelemetryPlatform;
};

export function buildMediaPipeTelemetryPayload({
    examSessionId,
    studentId,
    eventType,
    timestamp,
    metadata,
    sessionContext,
    platform,
}: BuildMediaPipeTelemetryPayloadArgs): MediaPipeTelemetryPayload {
    const eventDefinition = TELEMETRY_EVENT_DEFINITIONS[eventType];

    return {
        examSessionId,
        studentId,
        timestamp: timestamp ?? new Date().toISOString(),
        eventType,
        platform: platform ?? 'WEB',
        source: eventDefinition.source,
        ruleKey: eventDefinition.ruleKey,
        metadata,
        sessionContext,
    };
}

export function createMediaPipePreviewPayload(args: {
    eventType: MediaPipeSupportedEventType;
    metadata?: MediaPipeTelemetryMetadata;
    sessionContext?: MediaPipeTelemetrySessionContext;
}) {
    return buildMediaPipeTelemetryPayload({
        examSessionId: '00000000-0000-4000-8000-000000000001',
        studentId: '00000000-0000-4000-8000-000000000002',
        eventType: args.eventType,
        metadata: args.metadata,
        sessionContext: args.sessionContext,
    });
}
