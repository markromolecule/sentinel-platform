import { type DbClient } from '@sentinel/db';

export type RemoveQuestionBankCollectionQuestionsDataArgs = {
    dbClient: DbClient;
    collectionId: string;
    questionIds: string[];
};

export async function removeQuestionBankCollectionQuestionsData({
    dbClient,
    collectionId,
    questionIds,
}: RemoveQuestionBankCollectionQuestionsDataArgs) {
    if (questionIds.length === 0) {
        return [];
    }

    return await dbClient
        .deleteFrom('question_bank_collection_questions')
        .where('collection_id', '=', collectionId)
        .where('question_bank_question_id', 'in', questionIds)
        .returning(['question_bank_question_id'])
        .execute();
}
