import { type PersistableProctoringEvent } from '../../ingestion/ingestion.dto';
import { type ExamConfigurationValues } from '../../../examination/configuration/services/configuration.types';
import {
    TELEMETRY_EVENT_TO_INCIDENT_MAP,
    type TelemetryStorageMapping,
} from '../storage.constants';
import { type TelemetryConfigurationSnapshot } from '@sentinel/shared';
import { buildTelemetryConfigurationSnapshot } from './config-snapshot.builder';

export type TelemetryIncidentInsertShape = TelemetryStorageMapping & {
    platform: PersistableProctoringEvent['platform'];
    source: PersistableProctoringEvent['source'];
    ruleKey: PersistableProctoringEvent['ruleKey'];
    configurationSnapshot: TelemetryConfigurationSnapshot | null;
    sessionContext: PersistableProctoringEvent['sessionContext'] | null;
    dedupeKey: string;
    details: string;
};

/**
 * Maps a telemetry event type to its corresponding incident type and default severity.
 */
export function mapTelemetryEventToIncident(eventType: PersistableProctoringEvent['eventType']) {
    const incident = TELEMETRY_EVENT_TO_INCIDENT_MAP[eventType];

    if (!incident) {
        throw new Error(`Telemetry event type "${eventType}" is not mapped to an incident type.`);
    }

    return incident;
}

/**
 * Builds a deterministic stream key for same-rule event deduplication.
 */
export function buildTelemetryDedupeKey(payload: PersistableProctoringEvent): string {
    if (payload.metadata?.dedupeKey) {
        return payload.metadata.dedupeKey;
    }
    return [
        payload.examSessionId,
        payload.studentId,
        payload.platform,
        payload.source,
        payload.ruleKey,
        payload.eventType,
    ].join(':');
}

/**
 * Transforms a raw proctoring event into the database insertion shape.
 */
export function buildTelemetryIncidentInsertShape(
    payload: PersistableProctoringEvent,
    configuration?: ExamConfigurationValues | null,
): TelemetryIncidentInsertShape {
    const incident = mapTelemetryEventToIncident(payload.eventType);

    return {
        ...incident,
        severity:
            payload.runtimeSettingsSnapshot?.ruleOverrideApplied?.severity ?? incident.severity,
        platform: payload.platform,
        source: payload.source,
        ruleKey: payload.ruleKey,
        configurationSnapshot: buildTelemetryConfigurationSnapshot(payload.ruleKey, configuration),
        sessionContext: payload.sessionContext ?? null,
        dedupeKey: buildTelemetryDedupeKey(payload),
        details: JSON.stringify({
            eventType: payload.eventType,
            metadata: payload.metadata ?? null,
            telemetrySettings:
                payload.runtimeSettingsSnapshot === undefined
                    ? null
                    : {
                          version: payload.runtimeSettingsSnapshot.version,
                          ruleOverrideApplied:
                              payload.runtimeSettingsSnapshot.ruleOverrideApplied ?? null,
                      },
        }),
    };
}
