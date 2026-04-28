import { type DbClient } from '@sentinel/db';
import {
    getQuestionPerformanceStats,
    type QuestionPerformanceStat,
} from '../data/get-question-performance-stats';
import {
    updateQuestionActualDifficultyData,
    type QuestionDifficultyUpdate,
} from '../data/update-question-actual-difficulty';

/**
 * IRT P-Value thresholds
 *
 * P-Value = correct_count / total_attempted
 *
 * EASY:     P >= 0.85  (most students answered correctly → easy)
 * HARD:     P <= 0.29  (few students answered correctly → hard)
 * MODERATE: 0.30 <= P < 0.85
 */
const P_VALUE_EASY_THRESHOLD = 0.85;
const P_VALUE_HARD_THRESHOLD = 0.3;

export function mapPValueToDifficulty(pValue: number): 'EASY' | 'MODERATE' | 'HARD' {
    if (pValue >= P_VALUE_EASY_THRESHOLD) return 'EASY';
    if (pValue <= P_VALUE_HARD_THRESHOLD) return 'HARD';
    return 'MODERATE';
}

export type CalibrateQuestionDifficultyDependencies = {
    getQuestionPerformanceStats: typeof getQuestionPerformanceStats;
    updateQuestionActualDifficultyData: typeof updateQuestionActualDifficultyData;
};

export type CalibrateQuestionDifficultyArgs = {
    dbClient: DbClient;
    questionBankQuestionIds: string[];
    dependencies?: CalibrateQuestionDifficultyDependencies;
};

export type CalibrationResult = {
    calibrated: QuestionDifficultyUpdate[];
    skipped: string[];
};

/**
 * IRT Calibration Engine — computes P-Values from student attempt data
 * and writes the resulting actual_difficulty back to the question bank.
 *
 * - Questions with 0 attempts are skipped (no data to calibrate on).
 * - ESSAY and other manually-graded questions are excluded upstream.
 * - Dependencies are injected for testability.
 */
export async function calibrateQuestionDifficulty(
    args: CalibrateQuestionDifficultyArgs,
): Promise<CalibrationResult> {
    const {
        dbClient,
        questionBankQuestionIds,
        dependencies = {
            getQuestionPerformanceStats,
            updateQuestionActualDifficultyData,
        },
    } = args;

    if (questionBankQuestionIds.length === 0) {
        return { calibrated: [], skipped: [] };
    }

    // 1. Fetch per-question performance stats
    const stats: QuestionPerformanceStat[] = await dependencies.getQuestionPerformanceStats({
        dbClient,
        questionBankQuestionIds,
    });

    const statsById = new Map(stats.map((s) => [s.questionBankQuestionId, s]));

    const updates: QuestionDifficultyUpdate[] = [];
    const skipped: string[] = [];

    for (const id of questionBankQuestionIds) {
        const stat = statsById.get(id);

        // Skip: no attempt data yet
        if (!stat || stat.totalAttempted === 0) {
            skipped.push(id);
            continue;
        }

        const pValue = stat.correctCount / stat.totalAttempted;
        const difficulty = mapPValueToDifficulty(pValue);

        updates.push({
            questionBankQuestionId: id,
            actualDifficulty: difficulty,
        });
    }

    // 2. Persist difficulty updates
    if (updates.length > 0) {
        await dependencies.updateQuestionActualDifficultyData({
            dbClient,
            updates,
        });
    }

    return { calibrated: updates, skipped };
}
