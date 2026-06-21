import { describe, expect, it, vi } from 'vitest';
import { getQuestionBankCollections } from './question-bank';

describe('question bank api client services', () => {
    it('fetches paginated collections and preserves query parameters', async () => {
        const apiClient = vi.fn().mockResolvedValue({
            data: {
                items: [],
                page: 2,
                pageSize: 10,
                total: 25,
                totalPages: 3,
                hasMore: true,
            },
        });

        const result = await getQuestionBankCollections(apiClient, {
            search: 'biology',
            institutionId: 'inst-1',
            page: 2,
            pageSize: 10,
        });

        expect(apiClient).toHaveBeenCalledWith(
            '/question-bank/collections?search=biology&institutionId=inst-1&page=2&pageSize=10',
        );
        expect(result.page).toBe(2);
        expect(result.totalPages).toBe(3);
    });
});
