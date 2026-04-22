import {
    buildMediaPipeTelemetryPayload,
    type MediaPipeSupportedEventType,
    type MediaPipeTelemetryMetadata,
    type MediaPipeTelemetrySessionContext,
} from '@sentinel/shared';

export function mapMediaPipeEvent(args: {
    examSessionId: string;
    studentId: string;
    eventType: MediaPipeSupportedEventType;
    metadata?: MediaPipeTelemetryMetadata;
    sessionContext?: MediaPipeTelemetrySessionContext;
    timestamp?: string;
}) {
    return buildMediaPipeTelemetryPayload(args);
}
