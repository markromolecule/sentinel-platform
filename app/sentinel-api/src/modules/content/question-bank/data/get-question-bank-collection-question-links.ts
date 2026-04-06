import { type DbClient } from '@sentinel/db';

export type GetQuestionBankCollectionQuestionLinksDataArgs = {
    dbClient: DbClient;
    collectionId: string;
};

export async function getQuestionBankCollectionQuestionLinksData({
    dbClient,
    collectionId,
}: GetQuestionBankCollectionQuestionLinksDataArgs) {
    return await dbClient
        .selectFrom('question_bank_collection_questions')
        .selectAll()
        .where('collection_id', '=', collectionId)
        .orderBy('order_index', 'asc')
        .execute();
}
