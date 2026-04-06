import { type DbClient } from '@sentinel/db';

export type ArchiveQuestionsDataArgs = {
    dbClient: DbClient;
    ids: string[];
    institutionId?: string;
    archivedAt: Date;
};

export async function archiveQuestionsData({
    dbClient,
    ids,
    institutionId,
    archivedAt,
}: ArchiveQuestionsDataArgs) {
    if (ids.length === 0) {
        return [];
    }

    let query = dbClient
        .updateTable('question_bank_questions')
        .set({
            archived_at: archivedAt,
            updated_at: archivedAt,
        })
        .where('question_bank_question_id', 'in', ids)
        .where('archived_at', 'is', null)
        .returning(['question_bank_question_id']);

    if (institutionId) {
        query = query.where('institution_id', '=', institutionId);
    }

    return await query.execute();
}
