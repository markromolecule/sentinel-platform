import { type DbClient } from '@sentinel/db';
import { retireQuestionsData } from '../data/retire-questions';

const DEFAULT_EXPOSURE_LIMIT = 3;

export type CheckExposureThresholdArgs = {
    dbClient: DbClient;
    questionIds: string[];
    dependencies?: {
        retireQuestionsData: typeof retireQuestionsData;
    };
};

/**
 * Reads usage_count for the given question IDs and retires those that
 * have met or exceeded QB_EXPOSURE_LIMIT (env var, default 3).
 *
 * Called after incrementQuestionUsageData on exam publish.
 */
export async function checkExposureThreshold({
    dbClient,
    questionIds,
    dependencies = { retireQuestionsData },
}: CheckExposureThresholdArgs) {
    if (questionIds.length === 0) return;

    const exposureLimit = Number(process.env.QB_EXPOSURE_LIMIT) || DEFAULT_EXPOSURE_LIMIT;

    const rows = await dbClient
        .selectFrom('question_bank_questions')
        .select(['question_bank_question_id', 'usage_count'])
        .where('question_bank_question_id', 'in', questionIds)
        .execute();

    const overExposedIds = rows
        .filter((row) => row.usage_count >= exposureLimit)
        .map((row) => row.question_bank_question_id);

    if (overExposedIds.length > 0) {
        await dependencies.retireQuestionsData({ dbClient, questionIds: overExposedIds });
    }

    return { retiredCount: overExposedIds.length, retiredIds: overExposedIds };
}
