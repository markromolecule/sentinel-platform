import { type DbClient, executeTransaction } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';

interface ShareExamArgs {
    dbClient: DbClient;
    examId: string;
    userIds: string[];
    requestingUserId: string;
    institutionId: string | null;
}

/**
 * Updates the share list for an exam, restricted to the creator/owner.
 */
export async function shareExam(args: ShareExamArgs) {
    const { dbClient, examId, userIds, requestingUserId, institutionId } = args;

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
            message: 'Forbidden. Only the creator can share this exam.',
        });
    }

    const uniqueUserIds = [...new Set(userIds)];

    const filteredUserIds =
        uniqueUserIds.length === 0
            ? []
            : institutionId === null
              ? uniqueUserIds
              : (
                    await dbClient
                        .selectFrom('user_profiles')
                        .select('user_id')
                        .where('institution_id', '=', institutionId)
                        .where('user_id', 'in', uniqueUserIds)
                        .execute()
                ).map((record) => record.user_id);

    await executeTransaction(async (trx) => {
        await trx.deleteFrom('exam_shares').where('exam_id', '=', examId).execute();

        if (filteredUserIds.length > 0) {
            await trx
                .insertInto('exam_shares')
                .values(
                    filteredUserIds.map((userId) => ({
                        exam_id: examId,
                        user_id: userId,
                    })),
                )
                .execute();
        }
    });

    const sharedUsers = await dbClient
        .selectFrom('exam_shares as es')
        .innerJoin('user_profiles as up', 'up.user_id', 'es.user_id')
        .innerJoin('auth.users as u', 'u.id', 'es.user_id')
        .select(['es.user_id', 'up.first_name', 'up.last_name', 'u.email'])
        .where('es.exam_id', '=', examId)
        .orderBy('up.last_name', 'asc')
        .orderBy('up.first_name', 'asc')
        .execute();

    return sharedUsers;
}
