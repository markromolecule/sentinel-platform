import { type DbClient } from '@sentinel/db';

export type RetireQuestionsDataArgs = {
    dbClient: DbClient;
    questionIds: string[];
};

/**
 * Sets status = 'RETIRED' for a batch of question_bank_question_ids
 * that have exceeded the exposure threshold.
 */
export async function retireQuestionsData({ dbClient, questionIds }: RetireQuestionsDataArgs) {
    if (questionIds.length === 0) return;

    await dbClient
        .updateTable('question_bank_questions')
        .set({ status: 'RETIRED' })
        .where('question_bank_question_id', 'in', questionIds)
        .execute();
}
