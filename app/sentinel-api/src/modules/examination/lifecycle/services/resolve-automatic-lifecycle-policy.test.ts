import { randomUUID } from 'node:crypto';
import { describe, expect } from 'vitest';
import type { DbClient } from '@sentinel/db';
import { testWithDbClient } from '../../../../lib/test-with-db-client';
import { resolveAutomaticLifecyclePolicy } from './resolve-automatic-lifecycle-policy';

async function createAutomaticPolicyFixture(
    dbClient: DbClient,
    lifecycleState: 'IN_PROGRESS' | 'CLOSED' = 'IN_PROGRESS',
) {
    const suffix = randomUUID().slice(0, 8);
    const userId = randomUUID();

    await dbClient
        .insertInto('users')
        .values({
            id: userId,
            email: `policy-${suffix}@sentinel.test`,
            role: 'student',
            created_at: new Date(),
            updated_at: new Date(),
        })
        .executeTakeFirst();

    const institution = await dbClient
        .insertInto('institutions')
        .values({
            name: `Automatic Policy Institution ${suffix}`,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    const student = await dbClient
        .insertInto('students')
        .values({
            user_id: userId,
            student_number: `policy-${suffix}`,
            institution_id: institution.id,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    const exam = await dbClient
        .insertInto('exams')
        .values({
            title: `Automatic Policy Exam ${suffix}`,
            institution_id: institution.id,
            duration_minutes: 60,
            scheduled_date: new Date('2026-07-04T01:00:00.000Z'),
            end_date_time: new Date('2026-07-04T02:00:00.000Z'),
            published_at: new Date('2026-07-03T01:00:00.000Z'),
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    const attempt = await dbClient
        .insertInto('exam_attempts')
        .values({
            exam_id: exam.exam_id,
            student_id: student.student_id,
            status: 'IN_PROGRESS',
            lifecycle_state: lifecycleState,
            started_at: new Date('2026-07-04T01:00:00.000Z'),
            created_at: new Date('2026-07-04T01:00:00.000Z'),
            time_spent_minutes: 0,
            is_verified: false,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    return {
        examId: exam.exam_id,
        attemptId: attempt.attempt_id,
    };
}

async function insertHighIncident(dbClient: DbClient, attemptId: string, minuteOffset: number) {
    return dbClient
        .insertInto('flagged_incidents')
        .values({
            attempt_id: attemptId,
            incident_type: 'SCREENSHOT',
            platform: 'WEB',
            source: 'CLIENT',
            rule_key: 'webSecurity.print_screen_disable',
            severity: 'HIGH',
            status: 'PENDING',
            timestamp: new Date(Date.now() - minuteOffset * 60 * 1000),
            details: JSON.stringify({ eventType: 'PRINT_SCREEN_ATTEMPT' }),
        })
        .returning('incident_id')
        .executeTakeFirstOrThrow();
}

describe('resolveAutomaticLifecyclePolicy', () => {
    testWithDbClient('returns a close decision once the threshold is met', async ({ dbClient }) => {
        const fixture = await createAutomaticPolicyFixture(dbClient);

        await insertHighIncident(dbClient, fixture.attemptId, 1);
        await insertHighIncident(dbClient, fixture.attemptId, 3);
        const thirdIncident = await insertHighIncident(dbClient, fixture.attemptId, 5);

        const resolution = await resolveAutomaticLifecyclePolicy({
            dbClient,
            attemptId: fixture.attemptId,
        });

        expect(resolution).toMatchObject({
            action: 'CLOSE_ATTEMPT',
            attemptId: fixture.attemptId,
            examId: fixture.examId,
            reasonCode: 'AUTO_HIGH_INCIDENT_THRESHOLD',
        });
        expect(resolution.action === 'CLOSE_ATTEMPT' && resolution.matchingIncidentIds).toContain(
            thirdIncident.incident_id,
        );
    });

    testWithDbClient(
        'returns a no-op when the threshold is not applicable',
        async ({ dbClient }) => {
            const thresholdFixture = await createAutomaticPolicyFixture(dbClient);
            const closedFixture = await createAutomaticPolicyFixture(dbClient, 'CLOSED');

            await insertHighIncident(dbClient, thresholdFixture.attemptId, 1);
            await insertHighIncident(dbClient, thresholdFixture.attemptId, 3);
            await insertHighIncident(dbClient, closedFixture.attemptId, 1);
            await insertHighIncident(dbClient, closedFixture.attemptId, 2);
            await insertHighIncident(dbClient, closedFixture.attemptId, 3);

            const thresholdResolution = await resolveAutomaticLifecyclePolicy({
                dbClient,
                attemptId: thresholdFixture.attemptId,
            });
            const closedResolution = await resolveAutomaticLifecyclePolicy({
                dbClient,
                attemptId: closedFixture.attemptId,
            });

            expect(thresholdResolution).toMatchObject({
                action: 'NONE',
                attemptId: thresholdFixture.attemptId,
            });
            expect(closedResolution).toMatchObject({
                action: 'NONE',
                attemptId: closedFixture.attemptId,
                matchingIncidentIds: [],
            });
        },
    );
});
