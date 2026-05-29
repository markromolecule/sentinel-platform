import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { sql } from 'kysely';
import type { ExamAttemptAnswers } from '@sentinel/shared/types';
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
              sessionId: string;
              isResumed: true;
              answers: ExamAttemptAnswers;
              elapsedSeconds: number;
              reconnectAttemptCount: number;
              maxReconnectAttempts: number;
          }
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
            .select([
                'ea.attempt_id',
                'ea.completed_at',
                'ea.status',
                'ea.created_at',
                'ea.answer_snapshot',
                'ea.time_spent_minutes',
                'ea.reconnect_attempt_count',
            ])
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
            const reconnectAttemptCount = Number(existingAttempt.reconnect_attempt_count ?? 0);

            if (!accessOverride && reconnectAttemptCount >= maxReconnectAttempts) {
                throw new HTTPException(403, {
                    message: 'Maximum reconnect attempts reached for this exam session.',
                });
            }

            const nextReconnectAttemptCount = accessOverride
                ? reconnectAttemptCount
                : reconnectAttemptCount + 1;

            await db
                .updateTable('exam_attempts')
                .set({
                    reconnect_attempt_count: nextReconnectAttemptCount,
                    last_synced_at: new Date(),
                })
                .where('attempt_id', '=', existingAttempt.attempt_id)
                .execute();

            if (accessOverride) {
                await StudentOverridesService.markOverrideUsed({
                    dbClient: db,
                    accessOverride,
                    attemptId: existingAttempt.attempt_id,
                    updatedBy: args.updatedBy ?? null,
                });
            }

            return {
                sessionId: existingAttempt.attempt_id,
                isResumed: true,
                answers: (existingAttempt.answer_snapshot ?? {}) as ExamAttemptAnswers,
                elapsedSeconds: Math.max(0, Number(existingAttempt.time_spent_minutes ?? 0) * 60),
                reconnectAttemptCount: nextReconnectAttemptCount,
                maxReconnectAttempts,
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
                reconnect_attempt_count: 0,
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
                'st.institution_id',
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
            answeredCount: number;
            answers: ExamAttemptAnswers;
        },
    ) {
        return await db
            .updateTable('exam_attempts')
            .set({
                score: args.score,
                total_score: args.totalScore,
                time_spent_minutes: args.timeSpentMinutes,
                answered_question_count: args.answeredCount,
                answer_snapshot: args.answers as unknown,
                last_synced_at: new Date(),
                completed_at: new Date(),
                status: 'COMPLETED',
            })
            .where('attempt_id', '=', args.sessionId)
            .returning(['attempt_id', 'completed_at'])
            .executeTakeFirst();
    }

    static async updateSyncProgress(
        db: DbClient,
        args: {
            sessionId: string;
            answeredCount: number;
            timeSpentMinutes: number;
            answers?: ExamAttemptAnswers;
        },
    ) {
        const updateValues: {
            answered_question_count: number;
            time_spent_minutes: number;
            answer_snapshot?: unknown;
            last_synced_at: Date;
        } = {
            answered_question_count: args.answeredCount,
            time_spent_minutes: args.timeSpentMinutes,
            last_synced_at: new Date(),
        };

        if (args.answers) {
            updateValues.answer_snapshot = args.answers as unknown;
        }

        return await db
            .updateTable('exam_attempts')
            .set(updateValues)
            .where('attempt_id', '=', args.sessionId)
            .execute();
    }
}
