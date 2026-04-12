import { z } from 'zod';
import { Schema } from '@sentinel/shared';
import type { GenerateQuestionPreviewConfig } from '@sentinel/shared';
import { getQuestionTypeDistribution } from '../prompt-builder';
import { normalizeEnumToken, QUESTION_DIFFICULTY_ALIASES, QUESTION_TYPE_ALIASES } from './aliases';
import { InvalidQuestionTypeError } from './errors';

/**
 * Normalizes the AI-generated difficulty string into the application's
 * standard QuestionDifficulty format.
 */
export function normalizeDifficulty(
    difficulty: unknown,
    configDifficulty?: GenerateQuestionPreviewConfig['difficulty'],
): z.infer<typeof Schema.questionDifficultySchema> {
    if (configDifficulty) {
        return configDifficulty;
    }

    if (typeof difficulty !== 'string' || difficulty.trim().length === 0) {
        return 'MODERATE';
    }

    return QUESTION_DIFFICULTY_ALIASES[normalizeEnumToken(difficulty)] ?? 'MODERATE';
}

/**
 * Resolves and validates the AI-generated question type against the allowed
 * types specified in the preview configuration.
 */
export function resolveQuestionType(
    rawType: string | undefined,
    config: GenerateQuestionPreviewConfig,
): z.infer<typeof Schema.questionTypeSchema> {
    const requestedTypes = getQuestionTypeDistribution(config).map((item) => item.type);

    // If only one type was requested, force use of that type (ignoring AI's guess)
    if (requestedTypes.length === 1) {
        return requestedTypes[0];
    }

    if (!rawType) {
        throw new InvalidQuestionTypeError('Generated question type is missing.');
    }

    const normalizedType = QUESTION_TYPE_ALIASES[normalizeEnumToken(rawType)];

    if (!normalizedType || !requestedTypes.includes(normalizedType)) {
        throw new InvalidQuestionTypeError(
            `Generated question type "${rawType}" is not allowed by the preview config.`,
        );
    }

    return normalizedType;
}
