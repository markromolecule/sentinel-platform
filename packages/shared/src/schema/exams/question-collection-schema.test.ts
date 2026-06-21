import { describe, expect, it } from 'vitest';
import {
    getQuestionCollectionsQuerySchema,
    questionCollectionPageSchema,
    questionCollectionSchema,
} from './question-collection-schema';

describe('Question Collection Schemas', () => {
    describe('getQuestionCollectionsQuerySchema', () => {
        it('applies default pagination values', () => {
            const parsed = getQuestionCollectionsQuerySchema.safeParse({});

            expect(parsed.success).toBe(true);
            expect(parsed.data?.page).toBe(1);
            expect(parsed.data?.pageSize).toBe(20);
        });

        it('coerces page values from strings', () => {
            const parsed = getQuestionCollectionsQuerySchema.safeParse({
                page: '2',
                pageSize: '10',
            });

            expect(parsed.success).toBe(true);
            expect(parsed.data?.page).toBe(2);
            expect(parsed.data?.pageSize).toBe(10);
        });
    });

    describe('questionCollectionPageSchema', () => {
        it('validates a paginated collection payload', () => {
            const parsed = questionCollectionPageSchema.safeParse({
                items: [
                    {
                        id: '8f29ca39-fcad-4736-a41e-0f24ff4ea06f',
                        institutionId: null,
                        name: 'Reading Bank',
                        description: null,
                        tags: [],
                        isPublic: true,
                        questionCount: 3,
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
                questionCollectionSchema.safeParse({
                    id: '8f29ca39-fcad-4736-a41e-0f24ff4ea06f',
                    institutionId: null,
                    name: 'Reading Bank',
                    description: null,
                    tags: [],
                    isPublic: true,
                    questionCount: 3,
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
