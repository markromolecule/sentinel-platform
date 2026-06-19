import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';

interface UnshareExamArgs {
    dbClient: DbClient;
    examId: string;
    userId: string;
    requestingUserId: string;
}

/**
 * Removes a user from the share list of an exam, restricted to the creator/owner.
 */
export async function unshareExam(args: UnshareExamArgs) {
    const { dbClient, examId, userId, requestingUserId } = args;

    const exam = await dbClient
        .selectFrom('exams')
        .select(['exam_id', 'created_by'])
        .where('exam_id', '=', examId)
        .executeTakeFirst();

    if (!exam) {
        throw new HTTPException(404, { message: 'Exam not found.' });
    }

    if (exam.created_by !== requestingUserId) {
        throw new HTTPException(403, {
            message: 'Forbidden. Only the creator can unshare this exam.',
        });
    }

    await dbClient
        .deleteFrom('exam_shares')
        .where('exam_id', '=', examId)
        .where('user_id', '=', userId)
        .execute();
}
