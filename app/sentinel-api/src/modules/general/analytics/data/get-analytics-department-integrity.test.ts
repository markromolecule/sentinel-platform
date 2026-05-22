import { describe, expect, it, vi } from 'vitest';
import { getAnalyticsDepartmentIntegrityData } from './get-analytics-department-integrity';

describe('getAnalyticsDepartmentIntegrityData', () => {
    it('queries and returns department integrity metrics correctly', async () => {
        const mockRows = [
            { department: 'Engineering', completed: 100, flagged: 5, dropped: 10 },
            { department: 'Business', completed: 150, flagged: 15, dropped: 20 },
        ];

        const mockExecute = vi.fn().mockResolvedValue(mockRows);

        const mockDbClient = {
            selectFrom: vi.fn().mockReturnThis(),
            leftJoin: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            groupBy: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockReturnThis(),
            execute: mockExecute,
        } as any;

        const result = await getAnalyticsDepartmentIntegrityData(mockDbClient, {
            institutionId: 'inst-123',
        });

        expect(result).toEqual([
            { department: 'Engineering', completed: 100, flagged: 5, dropped: 10 },
            { department: 'Business', completed: 150, flagged: 15, dropped: 20 },
        ]);

        expect(mockDbClient.selectFrom).toHaveBeenCalledWith('departments as d');
        expect(mockDbClient.where).toHaveBeenCalledWith('d.institution_id', '=', 'inst-123');
    });
});
