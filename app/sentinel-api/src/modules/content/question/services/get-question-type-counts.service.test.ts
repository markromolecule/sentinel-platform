import { describe, expect, it, vi } from 'vitest';
import { getQuestionTypeCountsService } from './get-question-type-counts.service';
import { getQuestionTypeCountsData } from '../data/get-question-type-counts';

vi.mock('../data/get-question-type-counts', () => ({
    getQuestionTypeCountsData: vi.fn().mockResolvedValue({
        items: [{ type: 'MULTIPLE_CHOICE', count: 10 }],
        total: 10,
    }),
}));

describe('getQuestionTypeCountsService', () => {
    it('forwards database client, filters, user and institution IDs to the data access layer', async () => {
        const mockDb = { mockDb: true } as any;
        const filters = { search: 'calculus' };
        const result = await getQuestionTypeCountsService({
            dbClient: mockDb,
            filters,
            institutionId: 'inst-1',
            userId: 'user-1',
        });

        expect(getQuestionTypeCountsData).toHaveBeenCalledWith({
            dbClient: mockDb,
            institutionId: 'inst-1',
            filters,
            userId: 'user-1',
        });
        expect(result.total).toBe(10);
    });
});
