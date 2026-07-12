import { describe, expect, it, vi } from 'vitest';
import { getQuestions, getQuestionTypeCounts } from './questions';

describe('questions api client services', () => {
    it('fetches paginated questions and preserves query parameters', async () => {
        const apiClient = vi.fn().mockResolvedValue({
            data: {
                items: [],
                page: 1,
                pageSize: 20,
                total: 5,
                totalPages: 1,
                hasMore: false,
            },
        });

        const result = await getQuestions(apiClient, {
            search: 'calculus',
            type: 'MULTIPLE_CHOICE',
            page: 1,
            pageSize: 20,
        });

        expect(apiClient).toHaveBeenCalledWith(
            '/questions?search=calculus&type=MULTIPLE_CHOICE&page=1&pageSize=20',
        );
        expect(result.total).toBe(5);
    });

    it('fetches question type counts and filters out empty page/pageSize params', async () => {
        const apiClient = vi.fn().mockResolvedValue({
            data: {
                items: [
                    { type: 'MULTIPLE_CHOICE', count: 10 },
                    { type: 'TRUE_FALSE', count: 5 },
                ],
                total: 15,
            },
        });

        const result = await getQuestionTypeCounts(apiClient, {
            search: 'geometry',
            collectionId: '11111111-1111-4111-8111-111111111111',
        });

        expect(apiClient).toHaveBeenCalledWith(
            '/questions/type-counts?search=geometry&collectionId=11111111-1111-4111-8111-111111111111',
        );
        expect(result.total).toBe(15);
        expect(result.items).toHaveLength(2);
    });
});
