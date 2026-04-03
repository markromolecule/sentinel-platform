import { type DbClient } from '@sentinel/db';

export type ClearQuestionBankCollectionQuestionsDataArgs = {
    dbClient: DbClient;
    collectionId: string;
};

export async function clearQuestionBankCollectionQuestionsData({
    dbClient,
    collectionId,
}: ClearQuestionBankCollectionQuestionsDataArgs) {
    return await dbClient
        .deleteFrom('question_bank_collection_questions')
        .where('collection_id', '=', collectionId)
        .execute();
}
