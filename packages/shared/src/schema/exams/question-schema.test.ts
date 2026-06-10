import { describe, it, expect } from 'vitest';
import { getQuestionsQuerySchema, updateQuestionBodySchema } from './question-schema';
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
});
