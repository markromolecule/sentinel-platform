import { describe, expect, it } from 'vitest';
import { createBatches } from './create-batches';
import type { GenerateQuestionPreviewConfig } from '@sentinel/shared';

describe('createBatches utility', () => {
    it('splits questionCount into batches of batchSize', () => {
        const config: GenerateQuestionPreviewConfig = {
            target: 'QUESTION_COLLECTION',
            institutionId: '123',
            tags: [],
            isPublic: false,
            questionCount: 35,
        };
        const batches = createBatches(config, 15);
        expect(batches).toHaveLength(3);
        expect(batches[0].questionCount).toBe(15);
        expect(batches[1].questionCount).toBe(15);
        expect(batches[2].questionCount).toBe(5);
    });

    it('splits questionTypeDistribution correctly', () => {
        const config: GenerateQuestionPreviewConfig = {
            target: 'QUESTION_COLLECTION',
            institutionId: '123',
            tags: [],
            isPublic: false,
            questionCount: 8,
            questionTypeDistribution: [
                { type: 'MULTIPLE_CHOICE', count: 5 },
                { type: 'TRUE_FALSE', count: 3 },
            ],
        };
        const batches = createBatches(config, 5);
        expect(batches).toHaveLength(2);
        expect(batches[0].questionCount).toBe(5);
        expect(batches[0].questionTypeDistribution).toEqual([
            { type: 'MULTIPLE_CHOICE', count: 5 },
        ]);
        expect(batches[1].questionCount).toBe(3);
        expect(batches[1].questionTypeDistribution).toEqual([{ type: 'TRUE_FALSE', count: 3 }]);
    });
});
