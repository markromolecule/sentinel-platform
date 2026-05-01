import { randomUUID } from 'node:crypto';
import { DEFAULT_TELEMETRY_SETTINGS } from '@sentinel/shared';
import type { DbClient } from '@sentinel/db';
import { describe, expect } from 'vitest';
import { testWithDbClient } from '../../../../lib/test-with-db-client';
import type { PersistableProctoringEvent } from '../../ingestion/ingestion.dto';
import { IncidentPersistenceService } from './incident-persistence.service';

async function createTelemetryAttemptFixture(dbClient: DbClient) {
    const suffix = randomUUID().slice(0, 8);
    const userId = randomUUID();

    await dbClient
        .insertInto('users')
        .values({
            id: userId,
            email: `telemetry-${suffix}@sentinel.test`,
            role: 'student',
            created_at: new Date(),
            updated_at: new Date(),
        })
        .executeTakeFirst();

    const institution = await dbClient
        .insertInto('institutions')
        .values({
            name: `Telemetry Test Institution ${suffix}`,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    const student = await dbClient
        .insertInto('students')
        .values({
            user_id: userId,
            student_number: `telemetry-${suffix}`,
            institution_id: institution.id,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    const exam = await dbClient
        .insertInto('exams')
        .values({
            title: `Telemetry Severity ${suffix}`,
            institution_id: institution.id,
            duration_minutes: 60,
            scheduled_date: new Date('2026-04-22T06:00:00.000Z'),
            end_date_time: new Date('2026-04-22T07:00:00.000Z'),
            published_at: new Date('2026-04-21T06:00:00.000Z'),
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    const attempt = await dbClient
        .insertInto('exam_attempts')
        .values({
            exam_id: exam.exam_id,
            student_id: student.student_id,
            status: 'IN_PROGRESS',
            started_at: new Date('2026-04-22T06:00:00.000Z'),
            created_at: new Date('2026-04-22T06:00:00.000Z'),
            time_spent_minutes: 0,
            is_verified: false,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    return {
        attemptId: attempt.attempt_id,
        studentUserId: userId,
    };
}

function buildPayload(
    overrides: Partial<PersistableProctoringEvent> & {
        attemptId: string;
        studentUserId: string;
    },
): PersistableProctoringEvent {
    return {
        examSessionId: overrides.attemptId,
        studentId: overrides.studentUserId,
        timestamp: overrides.timestamp ?? new Date('2026-04-22T08:00:00.000Z').toISOString(),
        platform: overrides.platform ?? 'WEB',
        source: overrides.source ?? 'CLIENT',
        ruleKey: overrides.ruleKey ?? 'webSecurity.right_click_disable',
        eventType: overrides.eventType ?? 'RIGHT_CLICK_ATTEMPT',
        metadata: overrides.metadata,
        sessionContext: overrides.sessionContext,
        runtimeSettingsSnapshot:
            overrides.runtimeSettingsSnapshot === undefined
                ? {
                      version: DEFAULT_TELEMETRY_SETTINGS.version,
                      operations: { ...DEFAULT_TELEMETRY_SETTINGS.operations },
                      ruleOverrideApplied: null,
                  }
                : overrides.runtimeSettingsSnapshot,
    };
}

describe('IncidentPersistenceService', () => {
    testWithDbClient(
        'deduplicates same-rule events and does not merge or escalate mixed rules together',
        async ({ dbClient }) => {
            const fixture = await createTelemetryAttemptFixture(dbClient);

            await IncidentPersistenceService.appendEvent(dbClient, buildPayload(fixture));
            await IncidentPersistenceService.appendEvent(dbClient, buildPayload(fixture));
            await IncidentPersistenceService.appendEvent(
                dbClient,
                buildPayload({
                    ...fixture,
                    ruleKey: 'webSecurity.clipboard_control',
                    eventType: 'CLIPBOARD_ATTEMPT',
                }),
            );

            const incidents = await dbClient
                .selectFrom('flagged_incidents')
                .select(['incident_id', 'rule_key', 'severity', 'details'])
                .where('attempt_id', '=', fixture.attemptId)
                .orderBy('rule_key', 'asc')
                .execute();

            expect(incidents).toHaveLength(2);

            const clipboardIncident = incidents.find(
                (incident) => incident.rule_key === 'webSecurity.clipboard_control',
            );
            const rightClickIncident = incidents.find(
                (incident) => incident.rule_key === 'webSecurity.right_click_disable',
            );

            expect(clipboardIncident?.severity).toBe('MEDIUM');
            expect(JSON.parse(clipboardIncident?.details ?? '{}')).toMatchObject({
                occurrenceCount: 1,
                severityReason: 'default-ladder',
                currentSeverity: 'MEDIUM',
            });

            expect(rightClickIncident?.severity).toBe('MEDIUM');
            expect(JSON.parse(rightClickIncident?.details ?? '{}')).toMatchObject({
                occurrenceCount: 2,
                severityReason: 'repeat-escalated',
                previousSeverity: 'LOW',
                currentSeverity: 'MEDIUM',
                severityInputs: {
                    baseSeverity: 'LOW',
                    matchingCount: 2,
                    matchingWindowSeconds: 120,
                },
            });
        },
    );

    testWithDbClient(
        'honors a forced severity override when persisting incidents',
        async ({ dbClient }) => {
            const fixture = await createTelemetryAttemptFixture(dbClient);

            await IncidentPersistenceService.appendEvent(
                dbClient,
                buildPayload({
                    ...fixture,
                    runtimeSettingsSnapshot: {
                        version: DEFAULT_TELEMETRY_SETTINGS.version,
                        operations: { ...DEFAULT_TELEMETRY_SETTINGS.operations },
                        ruleOverrideApplied: {
                            severity: 'HIGH',
                        },
                    },
                }),
            );

            const incident = await dbClient
                .selectFrom('flagged_incidents')
                .select(['severity', 'details'])
                .where('attempt_id', '=', fixture.attemptId)
                .executeTakeFirstOrThrow();

            expect(incident.severity).toBe('HIGH');
            expect(JSON.parse(incident.details ?? '{}')).toMatchObject({
                severityReason: 'forced-override',
                currentSeverity: 'HIGH',
                severityInputs: {
                    baseSeverity: 'LOW',
                    overrideSeverity: 'HIGH',
                },
            });
        },
    );

    testWithDbClient(
        'persists browser security events with instructor-reviewable raw event details',
        async ({ dbClient }) => {
            const rightClickFixture = await createTelemetryAttemptFixture(dbClient);
            const printScreenFixture = await createTelemetryAttemptFixture(dbClient);

            await IncidentPersistenceService.appendEvent(
                dbClient,
                buildPayload({
                    ...rightClickFixture,
                    ruleKey: 'webSecurity.right_click_disable',
                    eventType: 'RIGHT_CLICK_ATTEMPT',
                }),
            );
            await IncidentPersistenceService.appendEvent(
                dbClient,
                buildPayload({
                    ...printScreenFixture,
                    ruleKey: 'webSecurity.print_screen_disable',
                    eventType: 'PRINT_SCREEN_ATTEMPT',
                }),
            );

            const incidents = await dbClient
                .selectFrom('flagged_incidents')
                .select(['attempt_id', 'incident_type', 'rule_key', 'severity', 'details'])
                .where('attempt_id', 'in', [
                    rightClickFixture.attemptId,
                    printScreenFixture.attemptId,
                ])
                .orderBy('rule_key', 'asc')
                .execute();

            expect(incidents).toHaveLength(2);

            const printScreenIncident = incidents.find(
                (incident) => incident.rule_key === 'webSecurity.print_screen_disable',
            );
            const rightClickIncident = incidents.find(
                (incident) => incident.rule_key === 'webSecurity.right_click_disable',
            );

            expect(rightClickIncident).toMatchObject({
                attempt_id: rightClickFixture.attemptId,
                incident_type: 'SUSPICIOUS_MOVEMENT',
                severity: 'LOW',
            });
            expect(JSON.parse(rightClickIncident?.details ?? '{}')).toMatchObject({
                eventType: 'RIGHT_CLICK_ATTEMPT',
                lastEvent: {
                    eventType: 'RIGHT_CLICK_ATTEMPT',
                },
                occurrenceCount: 1,
            });

            expect(printScreenIncident).toMatchObject({
                attempt_id: printScreenFixture.attemptId,
                incident_type: 'SCREENSHOT',
                severity: 'HIGH',
            });
            expect(JSON.parse(printScreenIncident?.details ?? '{}')).toMatchObject({
                eventType: 'PRINT_SCREEN_ATTEMPT',
                lastEvent: {
                    eventType: 'PRINT_SCREEN_ATTEMPT',
                },
                occurrenceCount: 1,
            });
        },
    );
});
