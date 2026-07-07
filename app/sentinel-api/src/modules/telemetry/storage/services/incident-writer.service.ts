import { HTTPException } from 'hono/http-exception';
import type { DbClient, incident_severity } from '@sentinel/db';
import type { PersistableProctoringEvent } from '../../ingestion/ingestion.dto';
import { telemetryConfigurationResolverService } from '../../ingestion/services/telemetry-configuration-resolver.service';
import { buildTelemetryIncidentInsertShape } from '../mappers/insert-incident.mapper';
import {
    buildIncidentDetails,
    getNextOccurrenceCount,
    parseIncidentDetails,
} from './incident-details.utils';
import type { AppendEventResult, IngestSessionType } from './incident-persistence.types';
import { incidentSeverityResolverService } from './incident-severity-resolver.service';

type MatchingIncident = {
    incident_id: string;
    details: unknown;
    severity: incident_severity | null;
    timestamp: Date | string | null;
    dedupe_key: string | null;
};

function isUniqueConstraintViolation(error: unknown): boolean {
    const code =
        error && typeof error === 'object' && 'code' in error
            ? (error as { code?: unknown }).code
            : null;
    const message = error instanceof Error ? error.message : String(error);

    return code === '23505' || message.includes('23505') || message.includes('unique constraint');
}

async function lockExamAttempt(db: DbClient, attemptId: string): Promise<void> {
    await db
        .selectFrom('exam_attempts')
        .select(['attempt_id'])
        .where('attempt_id', '=', attemptId)
        .forUpdate()
        .executeTakeFirst();
}

async function findDuplicateDedupeKeyIncident(
    db: DbClient,
    payload: PersistableProctoringEvent,
): Promise<{ incident_id: string } | undefined> {
    if (!payload.metadata?.dedupeKey) {
        return undefined;
    }

    return db
        .selectFrom('flagged_incidents')
        .select(['incident_id'])
        .where('attempt_id', '=', payload.examSessionId)
        .where('rule_key', '=', payload.ruleKey)
        .where('platform', '=', payload.platform)
        .where('dedupe_key', '=', payload.metadata.dedupeKey)
        .executeTakeFirst();
}

function findExistingIncidentWithinWindow(
    incidents: MatchingIncident[],
    dedupeThreshold: Date,
    currentDedupeKey?: string,
): MatchingIncident | undefined {
    return incidents.find((candidate) => {
        if (currentDedupeKey && candidate.dedupe_key === currentDedupeKey) {
            return false;
        }

        if (!candidate.timestamp) {
            return false;
        }

        const candidateTimestamp =
            candidate.timestamp instanceof Date
                ? candidate.timestamp
                : new Date(candidate.timestamp);

        return candidateTimestamp >= dedupeThreshold;
    });
}

async function updateExistingIncident(args: {
    db: DbClient;
    incident: MatchingIncident;
    insertDetails: Record<string, unknown>;
    payload: PersistableProctoringEvent;
    now: Date;
    finalSeverity: incident_severity;
    severityResolution: Parameters<typeof buildIncidentDetails>[0]['severityResolution'];
    session: IngestSessionType;
    logMessage: string;
}): Promise<AppendEventResult> {
    const existingDetails = parseIncidentDetails(args.incident.details);
    const occurrenceCount = getNextOccurrenceCount(existingDetails);

    await args.db
        .updateTable('flagged_incidents')
        .set({
            timestamp: args.now,
            severity: args.finalSeverity,
            details: buildIncidentDetails({
                existingDetails,
                insertDetails: args.insertDetails,
                occurrenceCount,
                severityResolution: args.severityResolution,
                previousSeverity: args.incident.severity ?? null,
                payload: args.payload,
            }),
        })
        .where('incident_id', '=', args.incident.incident_id)
        .execute();

    console.log(args.logMessage, {
        incidentId: args.incident.incident_id,
        attemptId: args.payload.examSessionId,
        occurrenceCount,
        severity: args.finalSeverity,
        settingsVersion: args.payload.runtimeSettingsSnapshot?.version ?? null,
    });

    return {
        incidentId: args.incident.incident_id,
        finalSeverity: args.finalSeverity,
        isNew: false,
        previousSeverity: args.incident.severity,
        institutionId: args.session.institution_id,
        studentUserId: args.session.user_id,
    };
}

async function findLatestMatchingIncident(
    db: DbClient,
    payload: PersistableProctoringEvent,
    ruleKey: string,
    platform: PersistableProctoringEvent['platform'],
): Promise<MatchingIncident | undefined> {
    return db
        .selectFrom('flagged_incidents')
        .select(['incident_id', 'details', 'severity', 'timestamp', 'dedupe_key'])
        .where('attempt_id', '=', payload.examSessionId)
        .where('rule_key', '=', ruleKey)
        .where('platform', '=', platform)
        .orderBy('timestamp', 'desc')
        .executeTakeFirst();
}

async function findMatchingIncidentByDedupeKey(
    db: DbClient,
    payload: PersistableProctoringEvent,
): Promise<MatchingIncident | undefined> {
    if (!payload.metadata?.dedupeKey) {
        return undefined;
    }

    return db
        .selectFrom('flagged_incidents')
        .select(['incident_id', 'details', 'severity', 'timestamp', 'dedupe_key'])
        .where('attempt_id', '=', payload.examSessionId)
        .where('rule_key', '=', payload.ruleKey)
        .where('platform', '=', payload.platform)
        .where('dedupe_key', '=', payload.metadata.dedupeKey)
        .executeTakeFirst();
}

export async function appendIncidentRecord(args: {
    db: DbClient;
    payload: PersistableProctoringEvent;
    session: IngestSessionType;
}): Promise<AppendEventResult | null> {
    await lockExamAttempt(args.db, args.payload.examSessionId);

    const configuration = await telemetryConfigurationResolverService.resolveAttemptConfiguration(
        args.db,
        args.payload.examSessionId,
    );
    const incident = buildTelemetryIncidentInsertShape(args.payload, configuration);
    const duplicateDedupeKey = await findDuplicateDedupeKeyIncident(args.db, args.payload);

    if (duplicateDedupeKey) {
        console.log('[TelemetryStorage] Duplicate dedupeKey detected, ignoring event.', {
            attemptId: args.payload.examSessionId,
            dedupeKey: args.payload.metadata?.dedupeKey,
        });
        return null;
    }

    const dedupeWindowSeconds =
        args.payload.runtimeSettingsSnapshot?.operations.dedupeWindowSeconds ?? 120;
    const now = new Date();
    const dedupeThreshold = new Date(now.getTime() - dedupeWindowSeconds * 1000);
    const matchingWindowSeconds = incidentSeverityResolverService.getLookbackWindowSeconds(
        args.payload.ruleKey,
        dedupeWindowSeconds,
    );
    const matchingThreshold = new Date(now.getTime() - matchingWindowSeconds * 1000);

    const matchingIncidents = await args.db
        .selectFrom('flagged_incidents')
        .select(['incident_id', 'details', 'severity', 'timestamp', 'dedupe_key'])
        .where('attempt_id', '=', args.payload.examSessionId)
        .where('rule_key', '=', incident.ruleKey)
        .where('platform', '=', incident.platform)
        .where('timestamp', '>=', matchingThreshold)
        .orderBy('timestamp', 'desc')
        .execute();

    const existingIncident = findExistingIncidentWithinWindow(
        matchingIncidents,
        dedupeThreshold,
        args.payload.metadata?.dedupeKey,
    );
    const severityResolution = incidentSeverityResolverService.resolveSeverity({
        ruleKey: args.payload.ruleKey,
        baseSeverity: incident.severity,
        matchingIncidents,
        now,
        runtimeOverride: args.payload.runtimeSettingsSnapshot?.ruleOverrideApplied ?? null,
        currentMetadata: args.payload.metadata ?? null,
    });
    const insertDetails = parseIncidentDetails(incident.details);

    if (existingIncident) {
        return updateExistingIncident({
            db: args.db,
            incident: existingIncident,
            insertDetails,
            payload: args.payload,
            now,
            finalSeverity: severityResolution.finalSeverity,
            severityResolution,
            session: args.session,
            logMessage: '[TelemetryStorage] Incident updated (deduplicated)',
        });
    }

    try {
        const insertedIncident = await args.db
            .insertInto('flagged_incidents')
            .values({
                attempt_id: args.payload.examSessionId,
                incident_type: incident.incidentType,
                platform: incident.platform,
                source: incident.source,
                rule_key: incident.ruleKey,
                severity: severityResolution.finalSeverity,
                details: buildIncidentDetails({
                    insertDetails,
                    occurrenceCount: 1,
                    severityResolution,
                    previousSeverity: null,
                    payload: args.payload,
                }),
                timestamp: now,
                status: 'PENDING',
                configuration_snapshot: incident.configurationSnapshot,
                session_context: incident.sessionContext,
                dedupe_key: args.payload.metadata?.dedupeKey ?? null,
            })
            .returning('incident_id')
            .executeTakeFirst();

        if (!insertedIncident) {
            console.error('[TelemetryStorage] Storage failure: insert failed', {
                attemptId: args.payload.examSessionId,
                eventType: args.payload.eventType,
            });
            throw new HTTPException(500, {
                message: 'Telemetry storage failure: failed to append incident record.',
            });
        }

        console.log('[TelemetryStorage] Incident appended successfully', {
            incidentId: insertedIncident.incident_id,
            attemptId: args.payload.examSessionId,
            eventType: args.payload.eventType,
            ruleKey: args.payload.ruleKey,
            platform: args.payload.platform,
            severity: severityResolution.finalSeverity,
            settingsVersion: args.payload.runtimeSettingsSnapshot?.version ?? null,
        });

        return {
            incidentId: insertedIncident.incident_id,
            finalSeverity: severityResolution.finalSeverity,
            isNew: true,
            previousSeverity: null,
            institutionId: args.session.institution_id,
            studentUserId: args.session.user_id,
        };
    } catch (error) {
        if (!isUniqueConstraintViolation(error)) {
            throw error;
        }

        const duplicateDedupeIncident = await findMatchingIncidentByDedupeKey(
            args.db,
            args.payload,
        );

        if (duplicateDedupeIncident) {
            console.log(
                '[TelemetryStorage] Duplicate dedupeKey resolved after concurrency retry, ignoring event.',
                {
                    attemptId: args.payload.examSessionId,
                    dedupeKey: args.payload.metadata?.dedupeKey,
                    incidentId: duplicateDedupeIncident.incident_id,
                },
            );
            return null;
        }

        const freshExistingIncident = args.payload.metadata?.dedupeKey
            ? undefined
            : await findLatestMatchingIncident(
                  args.db,
                  args.payload,
                  incident.ruleKey,
                  incident.platform,
              );

        if (!freshExistingIncident) {
            console.log(
                '[TelemetryStorage] Unique constraint violation caught but no existing incident resolved.',
                {
                    attemptId: args.payload.examSessionId,
                    dedupeKey: incident.dedupeKey,
                },
            );
            return null;
        }

        return updateExistingIncident({
            db: args.db,
            incident: freshExistingIncident,
            insertDetails,
            payload: args.payload,
            now,
            finalSeverity: severityResolution.finalSeverity,
            severityResolution,
            session: args.session,
            logMessage: '[TelemetryStorage] Incident updated concurrently (concurrency fallback)',
        });
    }
}
