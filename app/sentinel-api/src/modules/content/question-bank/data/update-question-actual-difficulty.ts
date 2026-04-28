import { type DbClient } from '@sentinel/db';

export type QuestionDifficultyUpdate = {
    questionBankQuestionId: string;
    actualDifficulty: 'EASY' | 'MODERATE' | 'HARD';
};

/**
 * Bulk-updates the actual_difficulty field for a set of question bank questions.
 * Uses individual updates to avoid Kysely's lack of native batch-CASE-WHEN support
 * while still keeping N within the calibration batch size (bounded upstream).
 */
export async function updateQuestionActualDifficultyData(args: {
    dbClient: DbClient;
    updates: QuestionDifficultyUpdate[];
}): Promise<void> {
    const { dbClient, updates } = args;

    if (updates.length === 0) return;

    // Execute as concurrent individual updates — calibration runs are infrequent
    // and the batch size is bounded by QB_EXPOSURE_LIMIT, keeping N small.
    await Promise.all(
        updates.map((update) =>
            dbClient
                .updateTable('question_bank_questions')
                .set({
                    actual_difficulty: update.actualDifficulty,
                })
                .where('question_bank_question_id', '=', update.questionBankQuestionId)
                .execute(),
        ),
    );
}
