import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';

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
        },
    ): Promise<{ sessionId: string; isResumed: boolean }> {
        const { studentId, examId, maxReconnectAttempts } = args;

        const existingAttempt = await db
            .selectFrom('exam_attempts')
            .select(['attempt_id', 'completed_at', 'status', 'created_at'])
            .where('exam_id', '=', examId)
            .where('student_id', '=', studentId)
            .orderBy('created_at', 'desc')
            .executeTakeFirst();

        if (existingAttempt?.completed_at || existingAttempt?.status === 'COMPLETED') {
            throw new HTTPException(409, {
                message: 'The exam has already been submitted for this student.',
            });
        }

        if (existingAttempt?.status === 'IN_PROGRESS') {
            return {
                sessionId: existingAttempt.attempt_id,
                isResumed: true,
            };
        }

        const attemptCountRow = await db
            .selectFrom('exam_attempts')
            .select((eb) => eb.fn.countAll<string>().as('attempt_count'))
            .where('exam_id', '=', examId)
            .where('student_id', '=', studentId)
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

        return {
            sessionId: createdAttempt.attempt_id,
            isResumed: false,
        };
    }
}
