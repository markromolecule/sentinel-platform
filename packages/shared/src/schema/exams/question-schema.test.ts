import { describe, it, expect } from 'vitest';
import {
    getQuestionsQuerySchema,
    questionRecordSchema,
    updateQuestionBodySchema,
    getQuestionTypeCountsQuerySchema,
    questionTypeCountSchema,
    questionTypeCountsResponseSchema,
} from './question-schema';
import { questionInputSchema } from './assessment-schema';
import { generateQuestionPreviewConfigSchema } from '../gemini/gemini-schema';

describe('Question and AI Config Schemas', () => {
    describe('getQuestionsQuerySchema', () => {
        it('should validate status field if provided', () => {
            const valid = {
                status: 'RETIRED',
                page: 1,
                pageSize: 20,
            };
            const parsed = getQuestionsQuerySchema.safeParse(valid);
            expect(parsed.success).toBe(true);
            expect(parsed.data?.status).toBe('RETIRED');
        });

        it('should allow undefined status', () => {
            const valid = {
                page: 1,
                pageSize: 20,
            };
            const parsed = getQuestionsQuerySchema.safeParse(valid);
            expect(parsed.success).toBe(true);
            expect(parsed.data?.status).toBeUndefined();
        });

        it('should reject invalid status', () => {
            const invalid = {
                status: 'INVALID_STATUS',
            };
            const parsed = getQuestionsQuerySchema.safeParse(invalid);
            expect(parsed.success).toBe(false);
        });
    });

    describe('updateQuestionBodySchema', () => {
        it('should validate status field if provided', () => {
            const valid = {
                status: 'ACTIVE',
            };
            const parsed = updateQuestionBodySchema.safeParse(valid);
            expect(parsed.success).toBe(true);
            expect(parsed.data?.status).toBe('ACTIVE');
        });

        it('should reject invalid status', () => {
            const invalid = {
                status: 'COOLING_OFF_INVALID',
            };
            const parsed = updateQuestionBodySchema.safeParse(invalid);
            expect(parsed.success).toBe(false);
        });
    });

    describe('questionInputSchema and questionRecordSchema', () => {
        it('accepts a plain passage payload', () => {
            const parsed = questionInputSchema.safeParse({
                type: 'MULTIPLE_CHOICE',
                content: { prompt: 'Prompt', options: ['A'], correctAnswer: 'A' },
                passageContent: 'Line 1\nLine 2',
                passageType: 'plain',
            });

            expect(parsed.success).toBe(true);
            expect(parsed.data?.passageType).toBe('plain');
        });

        it('accepts an html passage payload', () => {
            const parsed = questionInputSchema.safeParse({
                type: 'MULTIPLE_CHOICE',
                content: { prompt: 'Prompt', options: ['A'], correctAnswer: 'A' },
                passageContent: '<p><strong>Rich</strong> passage</p>',
                passageType: 'html',
            });

            expect(parsed.success).toBe(true);
            expect(parsed.data?.passageType).toBe('html');
        });

        it('rejects an unknown passage type', () => {
            const parsed = questionInputSchema.safeParse({
                type: 'MULTIPLE_CHOICE',
                content: { prompt: 'Prompt', options: ['A'], correctAnswer: 'A' },
                passageContent: 'Text',
                passageType: 'markdown',
            });

            expect(parsed.success).toBe(false);
        });

        it('accepts record payloads with passage fields', () => {
            const parsed = questionRecordSchema.safeParse({
                id: '8f29ca39-fcad-4736-a41e-0f24ff4ea06f',
                subjectId: null,
                institutionId: null,
                sourceOrigin: 'MANUAL',
                sourceFileName: null,
                sourcePageNumber: null,
                sourceEvidence: null,
                passageContent: '<p>Passage</p>',
                passageType: 'html',
                type: 'MULTIPLE_CHOICE',
                difficulty: 'MODERATE',
                points: 2,
                tags: [],
                content: { prompt: 'Prompt' },
                prompt: 'Prompt',
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: null,
                updatedBy: null,
                status: 'ACTIVE',
            });

            expect(parsed.success).toBe(true);
        });
    });

    describe('generateQuestionPreviewConfigSchema', () => {
        it('should validate bloomLevels if provided', () => {
            const valid = {
                target: 'QUESTION_BANK',
                questionCount: 5,
                questionType: 'MULTIPLE_CHOICE',
                bloomLevels: ['REMEMBERING', 'UNDERSTANDING'],
            };
            const parsed = generateQuestionPreviewConfigSchema.safeParse(valid);
            expect(parsed.success).toBe(true);
            expect(parsed.data?.bloomLevels).toEqual(['REMEMBERING', 'UNDERSTANDING']);
        });

        it('should reject invalid bloom levels', () => {
            const invalid = {
                target: 'QUESTION_BANK',
                questionCount: 5,
                questionType: 'MULTIPLE_CHOICE',
                bloomLevels: ['INVALID_COGNITIVE_LEVEL'],
            };
            const parsed = generateQuestionPreviewConfigSchema.safeParse(invalid);
            expect(parsed.success).toBe(false);
        });
    });

    describe('getQuestionTypeCountsQuerySchema', () => {
        it('validates correct query parameters', () => {
            const valid = {
                search: 'algebra',
                difficulty: 'HARD',
                subjectId: '11111111-1111-4111-8111-111111111111',
                status: 'ACTIVE',
            };
            const parsed = getQuestionTypeCountsQuerySchema.safeParse(valid);
            expect(parsed.success).toBe(true);
        });

        it('rejects invalid statuses or UUIDs', () => {
            const invalid = {
                subjectId: 'not-a-uuid',
                status: 'INVALID_STATUS',
            };
            const parsed = getQuestionTypeCountsQuerySchema.safeParse(invalid);
            expect(parsed.success).toBe(false);
        });
    });

    describe('questionTypeCountSchema and response schema', () => {
        it('validates a correct count record and list response', () => {
            const validCount = {
                type: 'MULTIPLE_CHOICE',
                count: 10,
            };
            expect(questionTypeCountSchema.safeParse(validCount).success).toBe(true);

            const validResponse = {
                items: [validCount, { type: 'TRUE_FALSE', count: 5 }],
                total: 15,
            };
            expect(questionTypeCountsResponseSchema.safeParse(validResponse).success).toBe(true);
        });

        it('rejects negative or non-integer counts', () => {
            const invalid = {
                type: 'MULTIPLE_CHOICE',
                count: -1,
            };
            expect(questionTypeCountSchema.safeParse(invalid).success).toBe(false);
        });
    });
});
