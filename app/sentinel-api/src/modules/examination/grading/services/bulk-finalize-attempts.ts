import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';

export type BulkFinalizeAttemptsArgs = {
    dbClient: DbClient;
    examId: string;
    actorUserId?: string | null;
    institutionId?: string;
};

/**
 * Bulk finalizes all completed attempts for a given exam by adding finalized
 * metadata to their answer snapshot.
 *
 * @param args - BulkFinalizeAttemptsArgs
 * @returns The count of finalized attempts.
 */
export async function bulkFinalizeAttempts({
    dbClient,
    examId,
    actorUserId,
    institutionId,
}: BulkFinalizeAttemptsArgs) {
    // 1. Verify exam exists and optional institution constraint
    let examQuery = dbClient
        .selectFrom('exams')
        .select(['exam_id'])
        .where('exam_id', '=', examId);

    if (institutionId) {
        examQuery = examQuery.where('institution_id', '=', institutionId);
    }

    const exam = await examQuery.executeTakeFirst();
    if (!exam) {
        throw new HTTPException(404, { message: 'Exam not found' });
    }

    // 2. Fetch all attempts for the exam
    const attempts = await dbClient
        .selectFrom('exam_attempts')
        .select(['attempt_id', 'status', 'completed_at', 'total_score', 'answer_snapshot'])
        .where('exam_id', '=', examId)
        .execute();

    // 3. Filter attempts that are not yet finalized
    const nonFinalizedAttempts = attempts.filter((attempt) => {
        const snapshot = (attempt.answer_snapshot ?? {}) as any;
        const grading = snapshot._grading || {};
        return !grading.finalizedAt;
    });

    if (nonFinalizedAttempts.length === 0) {
        return { count: 0 };
    }

    // 4. Update the answer snapshot for each non-finalized attempt
    const nowStr = new Date().toISOString();
    
    // Fetch total points for the exam to populate total_score if null
    const questions = await dbClient
        .selectFrom('exam_questions')
        .select(['points'])
        .where('exam_id', '=', examId)
        .execute();
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    for (const attempt of nonFinalizedAttempts) {
        const snapshot = (attempt.answer_snapshot ?? {}) as any;
        const grading = snapshot._grading || {};
        const updatedGrading = {
            ...grading,
            finalizedAt: nowStr,
            finalizedBy: actorUserId ?? null,
        };
        const updatedSnapshot = {
            ...snapshot,
            _grading: updatedGrading,
        };

        const updatePayload: Record<string, any> = {
            answer_snapshot: updatedSnapshot as any,
            last_synced_at: new Date(),
        };

        if (attempt.status !== 'COMPLETED') {
            updatePayload.status = 'COMPLETED';
        }
        if (!attempt.completed_at) {
            updatePayload.completed_at = nowStr;
        }
        if (attempt.total_score === null || attempt.total_score === undefined) {
            updatePayload.total_score = totalPoints;
        }

        await dbClient
            .updateTable('exam_attempts')
            .set(updatePayload)
            .where('attempt_id', '=', attempt.attempt_id)
            .execute();
    }

    return { count: nonFinalizedAttempts.length };
}
