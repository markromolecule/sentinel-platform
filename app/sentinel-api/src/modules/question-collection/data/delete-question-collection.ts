import { type DbClient } from '@sentinel/db';

export type DeleteQuestionCollectionDataArgs = {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
};

export async function deleteQuestionCollectionData({
    dbClient,
    id,
    institutionId,
}: DeleteQuestionCollectionDataArgs) {
    let query = dbClient
        .deleteFrom('question_bank_collections')
        .where('collection_id', '=', id)
        .returning(['collection_id']);

    if (institutionId) {
        query = query.where('institution_id', '=', institutionId);
    }

    return await query.executeTakeFirst();
}
