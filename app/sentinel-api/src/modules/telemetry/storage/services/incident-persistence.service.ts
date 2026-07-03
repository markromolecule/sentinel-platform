import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import type { PersistableProctoringEvent } from '../../ingestion/ingestion.dto';
import { telemetryConfigurationResolverService } from '../../ingestion/services/telemetry-configuration-resolver.service';
import { buildTelemetryIncidentInsertShape } from '../mappers/insert-incident.mapper';
import { incidentSeverityResolverService } from './incident-severity-resolver.service';
import { LogsService } from '../../../general/logs/logs.service';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';

function parseDetails(details: unknown): Record<string, unknown> {
    if (!details) {
        return {};
    }

    if (typeof details === 'string') {
        try {
            const parsed = JSON.parse(details);
            return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
        } catch {
            return {};
        }
    }

    return typeof details === 'object' ? (details as Record<string, unknown>) : {};
}

function getOccurrenceCount(details: unknown): number {
    const occurrenceCount = parseDetails(details).occurrenceCount;

    return typeof occurrenceCount === 'number' && occurrenceCount > 0 ? occurrenceCount : 1;
}

export class IncidentPersistenceService {
    /**
     * Appends proctoring events into the incident log.
     */
    static async appendEvent(db: DbClient, payload: PersistableProctoringEvent): Promise<void> {
        const session = await db
            .selectFrom('exam_attempts as ea')
            .innerJoin('students as s', 's.student_id', 'ea.student_id')
            .select([
                'ea.attempt_id',
                'ea.completed_at',
                'ea.status',
                's.user_id',
                's.institution_id',
            ])
            .where('ea.attempt_id', '=', payload.examSessionId)
            .executeTakeFirst();

        if (!session) {
            console.error('[TelemetryStorage] Storage failure: exam session not found', {
                attemptId: payload.examSessionId,
            });
            throw new HTTPException(404, {
                message: 'Exam session not found for telemetry ingestion.',
            });
        }

        if (session.user_id !== payload.studentId) {
            console.error('[TelemetryStorage] Storage failure: student mismatch', {
                attemptId: payload.examSessionId,
                payloadStudentId: payload.studentId,
                sessionUserId: session.user_id,
            });
            throw new HTTPException(403, {
                message: 'Telemetry payload does not belong to the current exam session.',
            });
        }

        const isCompletedSession = Boolean(session.completed_at || session.status === 'COMPLETED');

        if (isCompletedSession && payload.eventType === 'FULL_SCREEN_EXIT') {
            console.warn('[TelemetryStorage] Ignoring post-completion fullscreen telemetry', {
                attemptId: payload.examSessionId,
                completedAt: session.completed_at,
            });
            return;
        }

        // --- COMPLETION GRACE PERIOD LOGIC ---
        // We allow a small window (e.g., 5 minutes) after completion to ingest final telemetry batches.
        const TELEMETRY_GRACE_PERIOD_MS = 5 * 60 * 1000;
        const isRecentlyCompleted =
            session.completed_at &&
            new Date().getTime() - new Date(session.completed_at).getTime() <
                TELEMETRY_GRACE_PERIOD_MS;

        if (isCompletedSession && !isRecentlyCompleted) {
            console.warn(
                '[TelemetryStorage] Storage rejection: session completed and grace period expired',
                {
                    attemptId: payload.examSessionId,
                    completedAt: session.completed_at,
                },
            );
            throw new HTTPException(409, {
                message:
                    'Cannot ingest telemetry for a completed exam session (grace period expired).',
            });
        }

        const configuration =
            await telemetryConfigurationResolverService.resolveAttemptConfiguration(
                db,
                payload.examSessionId,
            );
        const incident = buildTelemetryIncidentInsertShape(payload, configuration);

        // --- DE-DUPLICATION & SEVERITY SCALING LOGIC ---
        const dedupeWindowSeconds =
            payload.runtimeSettingsSnapshot?.operations.dedupeWindowSeconds ?? 120;
        const now = new Date();
        const dedupeThreshold = new Date(now.getTime() - dedupeWindowSeconds * 1000);
        const matchingWindowSeconds = incidentSeverityResolverService.getLookbackWindowSeconds(
            payload.ruleKey,
            dedupeWindowSeconds,
        );
        const matchingThreshold = new Date(now.getTime() - matchingWindowSeconds * 1000);

        const matchingIncidents = await db
            .selectFrom('flagged_incidents')
            .select(['incident_id', 'details', 'severity', 'timestamp'])
            .where('attempt_id', '=', payload.examSessionId)
            .where('rule_key', '=', incident.ruleKey)
            .where('platform', '=', incident.platform)
            .where('timestamp', '>=', matchingThreshold)
            .orderBy('timestamp', 'desc')
            .execute();

        const existingIncident = matchingIncidents.find((candidate) => {
            if (!candidate.timestamp) {
                return false;
            }

            const candidateTimestamp =
                candidate.timestamp instanceof Date
                    ? candidate.timestamp
                    : new Date(candidate.timestamp);

            return candidateTimestamp >= dedupeThreshold;
        });

        const severityResolution = incidentSeverityResolverService.resolveSeverity({
            ruleKey: payload.ruleKey,
            baseSeverity: incident.severity,
            matchingIncidents,
            now,
            runtimeOverride: payload.runtimeSettingsSnapshot?.ruleOverrideApplied ?? null,
            currentMetadata: payload.metadata ?? null,
        });
        const insertDetails = parseDetails(incident.details);

        if (existingIncident) {
            // Update existing incident instead of creating a new one
            const existingDetails = parseDetails(existingIncident.details);
            const occurrenceCount = getOccurrenceCount(existingIncident.details) + 1;

            await db
                .updateTable('flagged_incidents')
                .set({
                    timestamp: now,
                    severity: severityResolution.finalSeverity as any,
                    details: JSON.stringify({
                        ...existingDetails,
                        ...insertDetails,
                        occurrenceCount,
                        severityReason: severityResolution.severityReason,
                        severityInputs: severityResolution.severityInputs,
                        previousSeverity: existingIncident.severity ?? null,
                        currentSeverity: severityResolution.finalSeverity,
                        lastEvent: {
                            eventType: payload.eventType,
                            timestamp: payload.timestamp,
                            metadata: payload.metadata,
                        },
                    }),
                })
                .where('incident_id', '=', existingIncident.incident_id)
                .execute();

            console.log('[TelemetryStorage] Incident updated (deduplicated)', {
                incidentId: existingIncident.incident_id,
                attemptId: payload.examSessionId,
                occurrenceCount,
                severity: severityResolution.finalSeverity,
                settingsVersion: payload.runtimeSettingsSnapshot?.version ?? null,
            });
            return;
        }

        const insertedIncident = await db
            .insertInto('flagged_incidents')
            .values({
                attempt_id: payload.examSessionId,
                incident_type: incident.incidentType,
                platform: incident.platform,
                source: incident.source,
                rule_key: incident.ruleKey,
                severity: severityResolution.finalSeverity as any,
                details: JSON.stringify({
                    ...insertDetails,
                    occurrenceCount: 1,
                    severityReason: severityResolution.severityReason,
                    severityInputs: severityResolution.severityInputs,
                    previousSeverity: null,
                    currentSeverity: severityResolution.finalSeverity,
                    lastEvent: {
                        eventType: payload.eventType,
                        timestamp: payload.timestamp,
                        metadata: payload.metadata,
                    },
                }),
                timestamp: now,
                status: 'PENDING',
                configuration_snapshot: incident.configurationSnapshot,
                session_context: incident.sessionContext,
                dedupe_key: incident.dedupeKey,
            })
            .returning('incident_id')
            .executeTakeFirst();

        if (!insertedIncident) {
            console.error('[TelemetryStorage] Storage failure: insert failed', {
                attemptId: payload.examSessionId,
                eventType: payload.eventType,
            });
            throw new Error('Telemetry storage failure: failed to append incident record.');
        }

        console.log('[TelemetryStorage] Incident appended successfully', {
            incidentId: insertedIncident.incident_id,
            attemptId: payload.examSessionId,
            eventType: payload.eventType,
            ruleKey: payload.ruleKey,
            platform: payload.platform,
            severity: severityResolution.finalSeverity,
            settingsVersion: payload.runtimeSettingsSnapshot?.version ?? null,
        });

        // Telemetry logging and notifications
        if (session.institution_id) {
            try {
                await LogsService.createLog(db, {
                    userId: session.user_id,
                    action: 'telemetry.incident_flagged',
                    resourceType: 'telemetry_incident',
                    resourceId: insertedIncident.incident_id,
                    activeInstitutionId: session.institution_id,
                    details: {
                        attemptId: payload.examSessionId,
                        eventType: payload.eventType,
                        ruleKey: payload.ruleKey,
                        severity: severityResolution.finalSeverity,
                    },
                });
                await ActivityNotificationService.notifyInstitutionActivityCreated({
                    dbClient: db,
                    actorUserId: session.user_id,
                    institutionId: session.institution_id,
                    targetType: 'TELEMETRY_INCIDENT',
                    targetId: insertedIncident.incident_id,
                    targetLabel: payload.ruleKey || 'Incident',
                    title: 'Proctoring incident flagged',
                    message: `Proctoring incident flagged for student attempt. Rule: ${payload.ruleKey}. Severity: ${severityResolution.finalSeverity}`,
                    sourceModule: 'telemetry',
                    sourceAction: 'flag-incident',
                    metadata: {
                        attemptId: payload.examSessionId,
                        incidentId: insertedIncident.incident_id,
                        ruleKey: payload.ruleKey,
                        severity: severityResolution.finalSeverity,
                    },
                });
            } catch (logErr) {
                console.error('Failed to log or notify telemetry.incident_flagged:', logErr);
            }
        }
    }

    /**
     * Appends a batch of proctoring events into the incident log using bulk operations.
     */
    static async appendBatch(db: DbClient, events: PersistableProctoringEvent[]): Promise<void> {
        if (events.length === 0) {
            return;
        }

        // Group events by session ID to optimize lookups
        const groups = new Map<string, PersistableProctoringEvent[]>();
        for (const event of events) {
            const list = groups.get(event.examSessionId) || [];
            list.push(event);
            groups.set(event.examSessionId, list);
        }

        for (const [sessionId, sessionEvents] of groups.entries()) {
            const session = await db
                .selectFrom('exam_attempts as ea')
                .innerJoin('students as s', 's.student_id', 'ea.student_id')
                .select(['ea.attempt_id', 'ea.completed_at', 'ea.status', 's.user_id'])
                .where('ea.attempt_id', '=', sessionId)
                .executeTakeFirst();

            if (!session) {
                console.error('[TelemetryStorage] Batch failure: exam session not found', {
                    sessionId,
                });
                continue;
            }

            if (session.completed_at || session.status === 'COMPLETED') {
                console.error('[TelemetryStorage] Batch failure: session completed', { sessionId });
                continue;
            }

            // Process each event in the session group to handle deduplication/scaling
            // For simplicity and correctness with the new logic, we'll process these
            // sequentially for now to ensure proper deduplication against the DB
            // and within the batch.
            for (const event of sessionEvents) {
                try {
                    await this.appendEvent(db, event);
                } catch (err) {
                    console.error('[TelemetryStorage] Batch event processing failed', {
                        sessionId,
                        eventType: event.eventType,
                    });
                }
            }

            console.log('[TelemetryStorage] Batch session processed successfully', {
                count: sessionEvents.length,
                attemptId: sessionId,
            });
        }
    }
}
