import type { GenerateQuestionPreviewConfig } from '@sentinel/shared';
import type { ExtractedPdfDocument } from '../pdf-page-extractor';
import type { RawGeneratedQuestion } from '../types';
import { normalizeGeneratedQuestions } from '../../question-normalizer';

/**
 * Step 5: Slices raw questions to the requested count and runs question normalization.
 */
export function normalizeQuestionsStep(
    rawQuestions: RawGeneratedQuestion[],
    config: GenerateQuestionPreviewConfig,
    sourceDocuments: ExtractedPdfDocument[],
) {
    const questionsToNormalize = rawQuestions.slice(0, config.questionCount);
    return normalizeGeneratedQuestions(
        questionsToNormalize,
        config,
        sourceDocuments,
    );
}
