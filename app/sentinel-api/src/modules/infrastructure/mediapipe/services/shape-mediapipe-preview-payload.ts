import {
    createMediaPipePreviewPayload,
    type MediaPipeSupportedEventType,
    type MediaPipeTelemetryMetadata,
    type MediaPipeTelemetrySessionContext,
} from '@sentinel/shared';

export function shapeMediaPipePreviewPayload(args: {
    eventType: MediaPipeSupportedEventType;
    metadata?: MediaPipeTelemetryMetadata;
    sessionContext?: MediaPipeTelemetrySessionContext;
}) {
    return createMediaPipePreviewPayload(args);
}
