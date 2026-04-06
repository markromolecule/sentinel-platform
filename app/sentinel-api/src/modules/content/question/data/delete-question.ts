import { type DbClient } from '@sentinel/db';

export type DeleteQuestionDataArgs = {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
    archivedAt: Date;
};

export async function deleteQuestionData({
    dbClient,
    id,
    institutionId,
    archivedAt,
}: DeleteQuestionDataArgs) {
    let query = dbClient
        .updateTable('question_bank_questions')
        .set({
            archived_at: archivedAt,
            updated_at: archivedAt,
        })
        .where('question_bank_question_id', '=', id)
        .where('archived_at', 'is', null)
        .returning(['question_bank_question_id']);

    if (institutionId) {
        query = query.where('institution_id', '=', institutionId);
    }

    return await query.executeTakeFirst();
}
