import { type DbClient } from '@sentinel/db';

export type GetQuestionCollectionQuestionLinksDataArgs = {
    dbClient: DbClient;
    collectionId: string;
};

export async function getQuestionCollectionQuestionLinksData({
    dbClient,
    collectionId,
}: GetQuestionCollectionQuestionLinksDataArgs) {
    return await dbClient
        .selectFrom('question_bank_collection_questions')
        .selectAll()
        .where('collection_id', '=', collectionId)
        .orderBy('order_index', 'asc')
        .execute();
}
