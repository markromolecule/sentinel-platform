import type { GenerateQuestionPreviewConfig } from '@sentinel/shared';

/**
 * Splits the question generation request into separate config batches if
 * a question type distribution is provided, capped at the specified batch size.
 */
export function createBatches(
    config: GenerateQuestionPreviewConfig,
    batchSize: number,
): GenerateQuestionPreviewConfig[] {
    const batches: GenerateQuestionPreviewConfig[] = [];
    const distribution = config.questionTypeDistribution ?? [];

    if (distribution.length > 0) {
        const remainingDist = distribution.map((d) => ({ ...d }));

        while (remainingDist.some((d) => d.count > 0)) {
            const currentBatchDist: GenerateQuestionPreviewConfig['questionTypeDistribution'] = [];
            let currentBatchCount = 0;

            for (const dist of remainingDist) {
                if (dist.count > 0 && currentBatchCount < batchSize) {
                    const take = Math.min(dist.count, batchSize - currentBatchCount);
                    dist.count -= take;
                    currentBatchCount += take;
                    currentBatchDist.push({ type: dist.type, count: take });
                }
            }

            batches.push({
                ...config,
                questionCount: currentBatchCount,
                questionTypeDistribution: currentBatchDist,
            });
        }
    } else {
        let remainingAmount = config.questionCount;
        while (remainingAmount > 0) {
            const take = Math.min(remainingAmount, batchSize);
            remainingAmount -= take;
            batches.push({
                ...config,
                questionCount: take,
            });
        }
    }

    return batches;
}
