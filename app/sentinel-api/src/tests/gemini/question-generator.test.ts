import { describe, expect, it } from 'vitest';
import type { GenerateQuestionPreviewConfig } from '@sentinel/shared';
import { buildResponseJsonSchema } from '../../lib/gemini/services/prompt-builder';
import { normalizeGeneratedQuestions } from '../../lib/gemini/services/question-normalizer';

const baseConfig: GenerateQuestionPreviewConfig = {
    target: 'QUESTION_COLLECTION',
    institutionId: '33560732-ef36-4670-b20c-a718f31179a0',
    tags: [],
    isPublic: false,
    questionType: 'MULTIPLE_CHOICE',
    questionCount: 2,
};

describe('Gemini question generator contracts', () => {
    it('normalizes human-readable Gemini enums before parsing question inputs', () => {
        const result = normalizeGeneratedQuestions(
            [
                {
                    type: 'multiple choice',
                    difficulty: 'medium',
                    points: 2,
                    tags: [' algebra ', 'algebra', ''],
                    content: {
                        prompt: 'What is 2 + 2?',
                        options: ['3', '4', '5', '6'],
                        correctAnswer: '4',
                    },
                },
            ],
            baseConfig,
        );

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            type: 'MULTIPLE_CHOICE',
            difficulty: 'MODERATE',
            points: 2,
            tags: ['algebra'],
        });
    });

    it('constrains Gemini response schema enums to internal values', () => {
        const mixedDifficultySchema = buildResponseJsonSchema(baseConfig) as any;
        const fixedDifficultySchema = buildResponseJsonSchema({
            ...baseConfig,
            difficulty: 'HARD',
        }) as any;

        expect(
            mixedDifficultySchema.properties.questions.items.properties.type.enum,
        ).toEqual(['MULTIPLE_CHOICE']);
        expect(
            mixedDifficultySchema.properties.questions.items.properties.difficulty.enum,
        ).toEqual(['EASY', 'MODERATE', 'HARD']);
        expect(
            fixedDifficultySchema.properties.questions.items.properties.difficulty.enum,
        ).toEqual(['HARD']);
    });

    it('normalizes mixed question content aliases before validating', () => {
        const result = normalizeGeneratedQuestions(
            [
                {
                    type: 'TRUE_FALSE',
                    difficulty: 'moderate',
                    points: 1,
                    content: {
                        statement: 'The Earth revolves around the Sun.',
                        answer: 'true',
                    },
                },
            ],
            {
                ...baseConfig,
                questionType: undefined,
                questionTypeDistribution: [
                    {
                        type: 'TRUE_FALSE',
                        count: 1,
                    },
                ],
                questionCount: 1,
            },
        );

        expect(result[0]).toMatchObject({
            type: 'TRUE_FALSE',
            content: {
                prompt: 'The Earth revolves around the Sun.',
                correctAnswer: true,
            },
        });
    });
});
