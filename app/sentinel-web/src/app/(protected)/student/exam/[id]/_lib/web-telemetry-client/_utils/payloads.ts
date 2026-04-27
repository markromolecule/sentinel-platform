import {
    TELEMETRY_EVENT_DEFINITIONS,
    buildMediaPipeTelemetryPayload as buildSharedMediaPipePayload,
    type ExamConfig,
} from '@sentinel/shared';
import type { IngestTelemetryEventPayload } from '@sentinel/services';
import type {
    BuildWebTelemetryPayloadArgs,
    BuildMediaPipeTelemetryPayloadArgs,
    WebTelemetryEventType,
    MediaPipeTelemetryEventType,
} from '../_types';
import {
    WEB_TELEMETRY_RULE_ENABLED_READERS,
    MEDIAPIPE_TELEMETRY_RULE_ENABLED_READERS,
} from '../_constants';
import { buildWebTelemetrySessionContext, buildMediaPipeTelemetrySessionContext } from './context';

export function isWebTelemetryEventEnabled(
    configuration: ExamConfig | undefined,
    eventType: WebTelemetryEventType,
) {
    if (!configuration) return false;
    return WEB_TELEMETRY_RULE_ENABLED_READERS[eventType](configuration);
}

export function buildWebTelemetryPayload({
    examSessionId,
    studentId,
    eventType,
    timestamp = new Date().toISOString(),
    metadata,
    sessionContext = buildWebTelemetrySessionContext(),
}: BuildWebTelemetryPayloadArgs): IngestTelemetryEventPayload {
    const eventDefinition = TELEMETRY_EVENT_DEFINITIONS[eventType];

    return {
        examSessionId,
        studentId,
        timestamp,
        eventType,
        platform: 'WEB',
        source: eventDefinition.source,
        ruleKey: eventDefinition.ruleKey,
        metadata,
        sessionContext,
    };
}

export function isMediaPipeTelemetryEventEnabled(
    configuration: ExamConfig | undefined,
    eventType: MediaPipeTelemetryEventType,
) {
    if (!configuration) return false;
    return MEDIAPIPE_TELEMETRY_RULE_ENABLED_READERS[eventType](configuration);
}

export function buildAttemptMediaPipeTelemetryPayload({
    examSessionId,
    studentId,
    eventType,
    timestamp = new Date().toISOString(),
    metadata,
    sessionContext = buildMediaPipeTelemetrySessionContext(),
}: BuildMediaPipeTelemetryPayloadArgs): IngestTelemetryEventPayload {
    return buildSharedMediaPipePayload({
        examSessionId,
        studentId,
        eventType,
        timestamp,
        metadata,
        sessionContext,
    });
}
