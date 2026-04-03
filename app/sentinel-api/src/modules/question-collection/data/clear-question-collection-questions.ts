import { type DbClient } from '@sentinel/db';

export type ClearQuestionCollectionQuestionsDataArgs = {
    dbClient: DbClient;
    collectionId: string;
};

export async function clearQuestionCollectionQuestionsData({
    dbClient,
    collectionId,
}: ClearQuestionCollectionQuestionsDataArgs) {
    return await dbClient
        .deleteFrom('question_bank_collection_questions')
        .where('collection_id', '=', collectionId)
        .execute();
}
