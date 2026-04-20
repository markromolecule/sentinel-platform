import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { sql } from 'kysely';
import type { StudentExamAccessOverride } from '../../student-overrides/student-overrides.dto';
import { StudentOverridesService } from '../../student-overrides/student-overrides.service';

export class SessionRepository {
    /**
     * Initializes or resumes a secure examination session using the persisted
     * exam attempt table, which is the closest durable session boundary we have.
     */
    static async createSession(
        db: DbClient,
        args: {
            studentId: string;
            examId: string;
            maxReconnectAttempts: number;
            accessOverride?: StudentExamAccessOverride | null;
            updatedBy?: string | null;
        },
    ): Promise<
        | { sessionId: string; isResumed: boolean }
        | {
              attemptId: string;
              error: string;
              errorCode: 'ATTEMPT_ALREADY_COMPLETED';
          }
    > {
        const { studentId, examId, maxReconnectAttempts, accessOverride } = args;

        const existingAttempt = await db
            .selectFrom('exam_attempts as ea')
            .innerJoin('exams as e', 'e.exam_id', 'ea.exam_id')
            .select(['ea.attempt_id', 'ea.completed_at', 'ea.status', 'ea.created_at'])
            .where('ea.exam_id', '=', examId)
            .where('ea.student_id', '=', studentId)
            .where((eb) =>
                eb.or([
                    eb('e.published_at', 'is', null),
                    sql<boolean>`coalesce(ea.started_at, ea.created_at) >= e.published_at`,
                ]),
            )
            .orderBy('ea.created_at', 'desc')
            .executeTakeFirst();

        if (
            (existingAttempt?.completed_at || existingAttempt?.status === 'COMPLETED') &&
            !accessOverride
        ) {
            return {
                attemptId: existingAttempt.attempt_id,
                error: 'This exam has already been turned in.',
                errorCode: 'ATTEMPT_ALREADY_COMPLETED',
            };
        }

        if (existingAttempt?.status === 'IN_PROGRESS') {
            return {
                sessionId: existingAttempt.attempt_id,
                isResumed: true,
            };
        }

        const attemptCountRow = await db
            .selectFrom('exam_attempts as ea')
            .innerJoin('exams as e', 'e.exam_id', 'ea.exam_id')
            .select((eb) => eb.fn.countAll<string>().as('attempt_count'))
            .where('ea.exam_id', '=', examId)
            .where('ea.student_id', '=', studentId)
            .where((eb) =>
                eb.or([
                    eb('e.published_at', 'is', null),
                    sql<boolean>`coalesce(ea.started_at, ea.created_at) >= e.published_at`,
                ]),
            )
            .executeTakeFirst();

        const attemptCount = Number(attemptCountRow?.attempt_count ?? 0);
        const maxSessionsAllowed = Math.max(1, maxReconnectAttempts + 1);

        if (attemptCount >= maxSessionsAllowed) {
            throw new HTTPException(403, {
                message: 'Maximum reconnect attempts reached for this exam session.',
            });
        }

        const createdAttempt = await db
            .insertInto('exam_attempts')
            .values({
                exam_id: examId,
                student_id: studentId,
                status: 'IN_PROGRESS',
                started_at: new Date(),
                created_at: new Date(),
                time_spent_minutes: 0,
                is_verified: false,
            })
            .returning('attempt_id')
            .executeTakeFirst();

        if (!createdAttempt) {
            throw new Error('Failed to initialize exam session.');
        }

        if (accessOverride) {
            await StudentOverridesService.markOverrideUsed({
                dbClient: db,
                accessOverride,
                attemptId: createdAttempt.attempt_id,
                updatedBy: args.updatedBy ?? null,
            });
        }

        return {
            sessionId: createdAttempt.attempt_id,
            isResumed: false,
        };
    }

    static async getOwnedSessionAttempt(
        db: DbClient,
        args: {
            sessionId: string;
            studentUserId: string;
        },
    ) {
        return await db
            .selectFrom('exam_attempts as ea')
            .innerJoin('students as st', 'st.student_id', 'ea.student_id')
            .select([
                'ea.attempt_id',
                'ea.exam_id',
                'ea.student_id',
                'ea.completed_at',
                'ea.status',
                'ea.started_at',
            ])
            .where('ea.attempt_id', '=', args.sessionId)
            .where('st.user_id', '=', args.studentUserId)
            .executeTakeFirst();
    }

    static async completeSession(
        db: DbClient,
        args: {
            sessionId: string;
            score: number;
            totalScore: number;
            timeSpentMinutes: number;
        },
    ) {
        return await db
            .updateTable('exam_attempts')
            .set({
                score: args.score,
                total_score: args.totalScore,
                time_spent_minutes: args.timeSpentMinutes,
                completed_at: new Date(),
                status: 'COMPLETED',
            })
            .where('attempt_id', '=', args.sessionId)
            .returning(['attempt_id', 'completed_at'])
            .executeTakeFirst();
    }
}
