import { randomUUID } from 'node:crypto';
import { describe, expect } from 'vitest';
import type { DbClient } from '@sentinel/db';
import { testWithDbClient } from '../../../lib/test-with-db-client';
import { IncidentsService } from './incidents.service';

async function createIncidentReviewFixture(dbClient: DbClient) {
    const suffix = randomUUID().slice(0, 8);
    const reviewerUserId = randomUUID();
    const studentOneUserId = randomUUID();
    const studentTwoUserId = randomUUID();

    for (const [id, email, role] of [
        [reviewerUserId, `reviewer-${suffix}@sentinel.test`, 'teacher'],
        [studentOneUserId, `student-one-${suffix}@sentinel.test`, 'student'],
        [studentTwoUserId, `student-two-${suffix}@sentinel.test`, 'student'],
    ] as const) {
        await dbClient
            .insertInto('users')
            .values({
                id,
                email,
                role,
                created_at: new Date(),
                updated_at: new Date(),
            })
            .executeTakeFirst();
    }

    const institution = await dbClient
        .insertInto('institutions')
        .values({
            name: `Incident Review Institution ${suffix}`,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    const [studentOne, studentTwo] = await Promise.all([
        dbClient
            .insertInto('students')
            .values({
                user_id: studentOneUserId,
                student_number: `student-one-${suffix}`,
                institution_id: institution.id,
            })
            .returningAll()
            .executeTakeFirstOrThrow(),
        dbClient
            .insertInto('students')
            .values({
                user_id: studentTwoUserId,
                student_number: `student-two-${suffix}`,
                institution_id: institution.id,
            })
            .returningAll()
            .executeTakeFirstOrThrow(),
    ]);

    const exam = await dbClient
        .insertInto('exams')
        .values({
            title: `Incident Review Exam ${suffix}`,
            institution_id: institution.id,
            duration_minutes: 60,
            scheduled_date: new Date('2026-07-04T01:00:00.000Z'),
            end_date_time: new Date('2026-07-04T02:00:00.000Z'),
            published_at: new Date('2026-07-03T01:00:00.000Z'),
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    const [attemptOne, attemptTwo] = await Promise.all([
        dbClient
            .insertInto('exam_attempts')
            .values({
                exam_id: exam.exam_id,
                student_id: studentOne.student_id,
                status: 'IN_PROGRESS',
                lifecycle_state: 'IN_PROGRESS',
                started_at: new Date('2026-07-04T01:00:00.000Z'),
                created_at: new Date('2026-07-04T01:00:00.000Z'),
                time_spent_minutes: 0,
                is_verified: false,
            })
            .returningAll()
            .executeTakeFirstOrThrow(),
        dbClient
            .insertInto('exam_attempts')
            .values({
                exam_id: exam.exam_id,
                student_id: studentTwo.student_id,
                status: 'IN_PROGRESS',
                lifecycle_state: 'IN_PROGRESS',
                started_at: new Date('2026-07-04T01:00:00.000Z'),
                created_at: new Date('2026-07-04T01:00:00.000Z'),
                time_spent_minutes: 0,
                is_verified: false,
            })
            .returningAll()
            .executeTakeFirstOrThrow(),
    ]);

    const [incidentOne, incidentTwo] = await Promise.all([
        dbClient
            .insertInto('flagged_incidents')
            .values({
                attempt_id: attemptOne.attempt_id,
                incident_type: 'TAB_SWITCH',
                platform: 'WEB',
                source: 'CLIENT',
                rule_key: 'webSecurity.tab_switching_monitor',
                severity: 'HIGH',
                status: 'PENDING',
                timestamp: new Date('2026-07-04T01:05:00.000Z'),
                details: JSON.stringify({ eventType: 'TAB_SWITCH' }),
            })
            .returning('incident_id')
            .executeTakeFirstOrThrow(),
        dbClient
            .insertInto('flagged_incidents')
            .values({
                attempt_id: attemptTwo.attempt_id,
                incident_type: 'TAB_SWITCH',
                platform: 'WEB',
                source: 'CLIENT',
                rule_key: 'webSecurity.tab_switching_monitor',
                severity: 'HIGH',
                status: 'PENDING',
                timestamp: new Date('2026-07-04T01:06:00.000Z'),
                details: JSON.stringify({ eventType: 'TAB_SWITCH' }),
            })
            .returning('incident_id')
            .executeTakeFirstOrThrow(),
    ]);

    return {
        reviewerUserId,
        examId: exam.exam_id,
        attemptOneId: attemptOne.attempt_id,
        attemptTwoId: attemptTwo.attempt_id,
        incidentOneId: incidentOne.incident_id,
        incidentTwoId: incidentTwo.incident_id,
    };
}

describe('IncidentsService.reviewExamIncidentsData', () => {
    testWithDbClient(
        'confirm-only review does not mutate attempt lifecycle state',
        async ({ dbClient }) => {
            const fixture = await createIncidentReviewFixture(dbClient);

            const result = await IncidentsService.reviewExamIncidentsData({
                dbClient,
                reviewerUserId: fixture.reviewerUserId,
                examId: fixture.examId,
                payload: {
                    incidentIds: [fixture.incidentOneId],
                    status: 'CONFIRMED',
                    reviewNotes: 'Reviewed and kept under watch.',
                },
            });

            const attempt = await dbClient
                .selectFrom('exam_attempts')
                .select(['lifecycle_state'])
                .where('attempt_id', '=', fixture.attemptOneId)
                .executeTakeFirstOrThrow();
            const lifecycleEvents = await dbClient
                .selectFrom('exam_attempt_lifecycle_events')
                .select(['event_type', 'attempt_id', 'related_incident_ids'])
                .where('attempt_id', '=', fixture.attemptOneId)
                .orderBy('created_at', 'desc')
                .execute();

            expect(result.attemptIds).toEqual([fixture.attemptOneId]);
            expect(attempt.lifecycle_state).toBe('IN_PROGRESS');
            expect(lifecycleEvents[0]).toMatchObject({
                event_type: 'INCIDENT_REVIEWED',
                attempt_id: fixture.attemptOneId,
            });
        },
    );

    testWithDbClient(
        'explicit confirm-and-close affects only the selected attempt',
        async ({ dbClient }) => {
            const fixture = await createIncidentReviewFixture(dbClient);

            await IncidentsService.reviewExamIncidentsData({
                dbClient,
                reviewerUserId: fixture.reviewerUserId,
                examId: fixture.examId,
                payload: {
                    incidentIds: [fixture.incidentOneId],
                    status: 'CONFIRMED',
                    reviewNotes: 'Confirmed integrity violation.',
                    lifecycleAction: 'CLOSE_ATTEMPT',
                    reasonCode: 'CONFIRMED_INCIDENT_CLOSE',
                    notes: 'Closing the affected attempt only.',
                },
            });

            const attempts = await dbClient
                .selectFrom('exam_attempts')
                .select(['attempt_id', 'lifecycle_state', 'closed_reason'])
                .where('attempt_id', 'in', [fixture.attemptOneId, fixture.attemptTwoId])
                .orderBy('attempt_id', 'asc')
                .execute();

            expect(attempts).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        attempt_id: fixture.attemptOneId,
                        lifecycle_state: 'CLOSED',
                        closed_reason: 'CONFIRMED_INCIDENT_CLOSE',
                    }),
                    expect.objectContaining({
                        attempt_id: fixture.attemptTwoId,
                        lifecycle_state: 'IN_PROGRESS',
                    }),
                ]),
            );
        },
    );
});
