import { describe, expect, it } from 'vitest';
import {
    getQuestionBankCollectionsQuerySchema,
    questionBankCollectionPageSchema,
    questionBankCollectionSchema,
} from './question-bank-schema';

describe('Question Bank Collection Schemas', () => {
    describe('getQuestionBankCollectionsQuerySchema', () => {
        it('applies default pagination values', () => {
            const parsed = getQuestionBankCollectionsQuerySchema.safeParse({});

            expect(parsed.success).toBe(true);
            expect(parsed.data?.page).toBe(1);
            expect(parsed.data?.pageSize).toBe(20);
        });

        it('coerces page values from strings', () => {
            const parsed = getQuestionBankCollectionsQuerySchema.safeParse({
                page: '3',
                pageSize: '15',
            });

            expect(parsed.success).toBe(true);
            expect(parsed.data?.page).toBe(3);
            expect(parsed.data?.pageSize).toBe(15);
        });
    });

    describe('questionBankCollectionPageSchema', () => {
        it('validates a paginated collection payload', () => {
            const parsed = questionBankCollectionPageSchema.safeParse({
                items: [
                    {
                        id: '8f29ca39-fcad-4736-a41e-0f24ff4ea06f',
                        institutionId: null,
                        name: 'Algebra Bank',
                        description: null,
                        tags: [],
                        isPublic: false,
                        questionCount: 0,
                        questionIds: [],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        createdBy: null,
                        updatedBy: null,
                        createdById: null,
                        updatedById: null,
                    },
                ],
                page: 1,
                pageSize: 20,
                total: 1,
                totalPages: 1,
                hasMore: false,
            });

            expect(parsed.success).toBe(true);
            expect(parsed.data?.items).toHaveLength(1);
        });

        it('reuses the collection schema for items', () => {
            expect(
                questionBankCollectionSchema.safeParse({
                    id: '8f29ca39-fcad-4736-a41e-0f24ff4ea06f',
                    institutionId: null,
                    name: 'Algebra Bank',
                    description: null,
                    tags: [],
                    isPublic: false,
                    questionCount: 0,
                    questionIds: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    createdBy: null,
                    updatedBy: null,
                    createdById: null,
                    updatedById: null,
                }).success,
            ).toBe(true);
        });
    });
});
