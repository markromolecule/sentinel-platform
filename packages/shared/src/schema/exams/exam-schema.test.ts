import { describe, expect, it } from 'vitest';
import { createExamBodySchema, updateExamBodySchema } from './exam-schema';

describe('exam-schema inheritance contracts', () => {
    const validCreateBody = {
        title: 'Quarterly Assessment',
        description:
            'Comprehensive quarterly assessment covering the first half of the curriculum.',
        subjectId: 'c7dca7b8-8cfb-4b8a-b0f4-68ed2b4cf3a1',
        sectionId: 'd3b07384-d113-4956-a5a0-b423366cae66',
        startDateTime: '2026-06-14T08:00:00.000Z',
        endDateTime: '2026-06-14T09:00:00.000Z',
        durationMinutes: 60,
    };

    it('allows inherited passing score and general settings to be omitted on create', () => {
        const result = createExamBodySchema.safeParse(validCreateBody);

        expect(result.success).toBe(true);
        expect(result.data?.passingScore).toBeUndefined();
        expect(result.data?.shuffleQuestions).toBeUndefined();
        expect(result.data?.configuration).toBeUndefined();
    });

    it('allows update payloads to revert inherited settings with explicit nulls', () => {
        const result = updateExamBodySchema.safeParse({
            passingScore: null,
            shuffleQuestions: null,
            settings: {
                showCorrectAnswers: null,
            },
            configuration: {
                strictMode: null,
                webSecurity: null,
            },
        });

        expect(result.success).toBe(true);
        expect(result.data).toMatchObject({
            passingScore: null,
            shuffleQuestions: null,
            settings: {
                showCorrectAnswers: null,
            },
            configuration: {
                strictMode: null,
                webSecurity: null,
            },
        });
    });
});
