import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import type { PersistableProctoringEvent } from '../../ingestion/ingestion.dto';
import { telemetryConfigurationResolverService } from '../../ingestion/services/telemetry-configuration-resolver.service';
import { buildTelemetryIncidentInsertShape } from '../mappers/insert-incident.mapper';

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

        if (session.completed_at || session.status === 'COMPLETED') {
            console.error('[TelemetryStorage] Storage failure: session completed', {
                attemptId: payload.examSessionId,
            });
            throw new HTTPException(409, {
                message: 'Cannot ingest telemetry for a completed exam session.',
            });
        }

        const configuration =
            await telemetryConfigurationResolverService.resolveAttemptConfiguration(
                db,
                payload.examSessionId,
            );
        const incident = buildTelemetryIncidentInsertShape(payload, configuration);

        const insertedIncident = await db
            .insertInto('flagged_incidents')
            .values({
                attempt_id: payload.examSessionId,
                incident_type: incident.incidentType,
                platform: incident.platform,
                source: incident.source,
                rule_key: incident.ruleKey,
                severity: incident.severity,
                details: incident.details,
                timestamp: new Date(payload.timestamp),
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

            const insertValues = sessionEvents.map((event) => {
                const incident = buildTelemetryIncidentInsertShape(event, configuration);
                return {
                    attempt_id: event.examSessionId,
                    incident_type: incident.incidentType,
                    platform: incident.platform,
                    source: incident.source,
                    rule_key: incident.ruleKey,
                    severity: incident.severity,
                    details: incident.details,
                    timestamp: new Date(event.timestamp),
                    status: 'PENDING',
                    configuration_snapshot: incident.configurationSnapshot,
                    session_context: incident.sessionContext,
                    dedupe_key: incident.dedupeKey,
                };
            });

            await db.insertInto('flagged_incidents').values(insertValues).execute();

            console.log('[TelemetryStorage] Batch incidents appended successfully', {
                count: insertValues.length,
                attemptId: sessionId,
            });
        }
    }
}
