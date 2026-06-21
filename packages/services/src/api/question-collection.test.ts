import { describe, expect, it, vi } from 'vitest';
import { getQuestionCollections } from './question-collection';

describe('question collection api client services', () => {
    it('fetches paginated collections from the question collection endpoint', async () => {
        const apiClient = vi.fn().mockResolvedValue({
            data: {
                items: [],
                page: 1,
                pageSize: 20,
                total: 0,
                totalPages: 0,
                hasMore: false,
            },
        });

        const result = await getQuestionCollections(apiClient, {
            search: 'reading',
            institutionId: 'inst-1',
            page: 1,
            pageSize: 20,
        });

        expect(apiClient).toHaveBeenCalledWith(
            '/question-collection/collections?search=reading&institutionId=inst-1&page=1&pageSize=20',
        );
        expect(result.hasMore).toBe(false);
    });
});
