import { describe, expect, it, vi } from 'vitest';
import { getAnalyticsKPIsData } from './get-analytics-kpis';

describe('getAnalyticsKPIsData', () => {
    it('queries and aggregates KPIs correctly', async () => {
        const mockExecuteTakeFirst = vi
            .fn()
            .mockResolvedValueOnce({ count: 10 }) // totalExams
            .mockResolvedValueOnce({ count: 100 }) // totalAttempts
            .mockResolvedValueOnce({ count: 80 }) // completedAttempts
            .mockResolvedValueOnce({ count: 25 }) // totalIncidents
            .mockResolvedValueOnce({ count: 15 }) // flaggedAttempts
            .mockResolvedValueOnce({ count: 5 }); // activeExams

        const mockDbClient = {
            selectFrom: vi.fn().mockReturnThis(),
            innerJoin: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            distinct: vi.fn().mockReturnThis(),
            executeTakeFirst: mockExecuteTakeFirst,
            fn: {
                countAll: vi.fn(),
                count: vi.fn().mockReturnThis(),
            },
        } as any;

        const result = await getAnalyticsKPIsData(mockDbClient, { institutionId: 'inst-123' });

        expect(result).toEqual({
            totalExams: 10,
            totalAttempts: 100,
            completedAttempts: 80,
            totalIncidents: 25,
            flaggedAttempts: 15,
            activeExams: 5,
        });

        expect(mockDbClient.selectFrom).toHaveBeenCalledTimes(6);
        expect(mockDbClient.where).toHaveBeenCalled();
    });
});
