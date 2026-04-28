import { type DbClient } from '@sentinel/db';

export type IncrementQuestionUsageDataArgs = {
    dbClient: DbClient;
    questionIds: string[];
};

/**
 * Increments usage_count by 1 and sets last_used_at to NOW()
 * for a batch of question_bank_question_ids.
 * Called whenever an exam containing these questions is published.
 */
export async function incrementQuestionUsageData({
    dbClient,
    questionIds,
}: IncrementQuestionUsageDataArgs) {
    if (questionIds.length === 0) return;

    await dbClient
        .updateTable('question_bank_questions')
        .set((eb) => ({
            usage_count: eb('usage_count', '+', 1),
            last_used_at: new Date(),
        }))
        .where('question_bank_question_id', 'in', questionIds)
        .execute();
}
