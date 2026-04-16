import type { GenerateQuestionPreviewConfig } from '@sentinel/shared';
import type { QuestionType } from './definitions';

/**
 * Normalizes the question distribution from the generation config.
 */
export function getQuestionTypeDistribution(config: GenerateQuestionPreviewConfig) {
    if (config.questionTypeDistribution?.length) {
        return config.questionTypeDistribution;
    }

    if (config.questionType) {
        return [
            {
                type: config.questionType,
                count: config.questionCount,
            },
        ];
    }

    return [];
}

/**
 * Extracts allowed question type enum values from the generation config.
 */
export function getAllowedQuestionTypes(config: GenerateQuestionPreviewConfig): QuestionType[] {
    return getQuestionTypeDistribution(config).map((item) => item.type);
}
