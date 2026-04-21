import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import type { PersistableProctoringEvent } from '../../ingestion/ingestion.dto';
import { telemetryConfigurationResolverService } from '../../ingestion/services/telemetry-configuration-resolver.service';
import { buildTelemetryIncidentInsertShape } from '../mappers/insert-incident.mapper';
import { sql } from 'kysely';

export class IncidentPersistenceService {
    /**
     * Appends proctoring events into the incident log.
     */
    static async appendEvent(db: DbClient, payload: PersistableProctoringEvent): Promise<void> {
        const session = await db
            .selectFrom('exam_attempts as ea')
            .innerJoin('students as s', 's.student_id', 'ea.student_id')
            .select(['ea.attempt_id', 'ea.completed_at', 'ea.status', 's.user_id'])
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

        // --- COMPLETION GRACE PERIOD LOGIC ---
        // We allow a small window (e.g., 5 minutes) after completion to ingest final telemetry batches.
        const TELEMETRY_GRACE_PERIOD_MS = 5 * 60 * 1000;
        const isRecentlyCompleted =
            session.completed_at &&
            new Date().getTime() - new Date(session.completed_at).getTime() <
                TELEMETRY_GRACE_PERIOD_MS;

        if ((session.completed_at || session.status === 'COMPLETED') && !isRecentlyCompleted) {
            console.error(
                '[TelemetryStorage] Storage failure: session completed and grace period expired',
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
        const ESCALATION_WINDOW_MINUTES = 5;
        const ESCALATION_THRESHOLD = 3;

        const now = new Date();
        const dedupeThreshold = new Date(now.getTime() - dedupeWindowSeconds * 1000);
        const escalationThreshold = new Date(now.getTime() - ESCALATION_WINDOW_MINUTES * 60000);

        // 1. Check for recent identical incident for deduplication
        const existingIncident = await db
            .selectFrom('flagged_incidents')
            .select(['incident_id', 'details', 'severity'])
            .where('attempt_id', '=', payload.examSessionId)
            .where('incident_type', '=', incident.incidentType)
            .where('timestamp', '>=', dedupeThreshold)
            .orderBy('timestamp', 'desc')
            .executeTakeFirst();

        // 2. Count recent incidents of any type for severity scaling
        const recentIncidentsCount = await db
            .selectFrom('flagged_incidents')
            .select(sql<number>`count(*)::int`.as('count'))
            .where('attempt_id', '=', payload.examSessionId)
            .where('timestamp', '>=', escalationThreshold)
            .executeTakeFirst();

        const totalRecentEvents = (recentIncidentsCount?.count ?? 0) + 1;

        // Scale severity if threshold exceeded
        let finalSeverity = incident.severity;
        if (totalRecentEvents >= ESCALATION_THRESHOLD) {
            finalSeverity = 'HIGH';
        }

        if (existingIncident) {
            // Update existing incident instead of creating a new one
            const details =
                typeof existingIncident.details === 'string'
                    ? JSON.parse(existingIncident.details)
                    : existingIncident.details || {};

            const occurrenceCount = (details.occurrenceCount || 1) + 1;

            await db
                .updateTable('flagged_incidents')
                .set({
                    timestamp: now,
                    severity: finalSeverity as any,
                    details: JSON.stringify({
                        ...details,
                        occurrenceCount,
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
                severity: finalSeverity as any,
                details: JSON.stringify({
                    ...JSON.parse(incident.details),
                    occurrenceCount: 1,
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
            severity: finalSeverity,
            settingsVersion: payload.runtimeSettingsSnapshot?.version ?? null,
        });
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

            const configuration =
                await telemetryConfigurationResolverService.resolveAttemptConfiguration(
                    db,
                    sessionId,
                );

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
