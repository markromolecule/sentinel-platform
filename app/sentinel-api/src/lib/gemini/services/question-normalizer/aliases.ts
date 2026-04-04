import { z } from 'zod';
import { Schema } from '@sentinel/shared';
import { QUESTION_TYPE_LABELS } from '../prompt-builder';

/**
 * Normalizes a token into a standard UPPER_SNAKE_CASE format.
 */
export function normalizeEnumToken(value: string) {
    return value
        .trim()
        .toUpperCase()
        .replace(/&/g, ' AND ')
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

export const QUESTION_DIFFICULTY_ALIASES: Record<
    string,
    z.infer<typeof Schema.questionDifficultySchema>
> = {
    EASY: 'EASY',
    SIMPLE: 'EASY',
    BASIC: 'EASY',
    BEGINNER: 'EASY',
    MODERATE: 'MODERATE',
    MEDIUM: 'MODERATE',
    INTERMEDIATE: 'MODERATE',
    AVERAGE: 'MODERATE',
    HARD: 'HARD',
    DIFFICULT: 'HARD',
    ADVANCED: 'HARD',
    CHALLENGING: 'HARD',
};

export const QUESTION_TYPE_ALIASES: Record<
    string,
    z.infer<typeof Schema.questionTypeSchema>
> = Object.entries(QUESTION_TYPE_LABELS).reduce(
    (aliases, [type, label]) => {
        aliases[type] = type as z.infer<typeof Schema.questionTypeSchema>;
        aliases[normalizeEnumToken(label)] = type as z.infer<typeof Schema.questionTypeSchema>;

        return aliases;
    },
    {
        MCQ: 'MULTIPLE_CHOICE',
        MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
        MULTIPLE_RESPONSE: 'MULTIPLE_RESPONSE',
        MULTI_SELECT: 'MULTIPLE_RESPONSE',
        MULTISELECT: 'MULTIPLE_RESPONSE',
        TRUE_FALSE: 'TRUE_FALSE',
        TRUE_OR_FALSE: 'TRUE_FALSE',
        IDENTIFICATION: 'IDENTIFICATION',
        MATCHING: 'MATCHING',
        ESSAY: 'ESSAY',
        SHORT_ANSWER: 'ESSAY',
        FILL_BLANK: 'FILL_BLANK',
        FILL_IN_THE_BLANK: 'FILL_BLANK',
        ENUMERATION: 'ENUMERATION',
    } as Record<string, z.infer<typeof Schema.questionTypeSchema>>,
);
