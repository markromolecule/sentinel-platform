import { describe, expect, it, vi } from 'vitest';
import { getAnalyticsIncidentSeverityData } from './get-analytics-incident-severity';

vi.mock('../../notification/helper/resolve-related-institutions', () => ({
    resolveRelatedInstitutions: vi.fn((_dbClient, institutionId) =>
        Promise.resolve(institutionId ? [institutionId] : []),
    ),
}));

describe('getAnalyticsIncidentSeverityData', () => {
    it('queries and returns severity distribution correctly', async () => {
        const mockRows = [
            { severity: 'LOW', count: 10 },
            { severity: 'MEDIUM', count: 20 },
            { severity: 'HIGH', count: 10 },
        ];

        const mockExecute = vi.fn().mockResolvedValue(mockRows);

        const mockDbClient = {
            selectFrom: vi.fn().mockReturnThis(),
            innerJoin: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            groupBy: vi.fn().mockReturnThis(),
            execute: mockExecute,
            fn: {
                count: vi.fn(),
            },
        } as any;

        const result = await getAnalyticsIncidentSeverityData(mockDbClient, {
            institutionId: 'inst-123',
        });

        expect(result).toEqual([
            { severity: 'LOW', count: 10, percentage: 25 },
            { severity: 'MEDIUM', count: 20, percentage: 50 },
            { severity: 'HIGH', count: 10, percentage: 25 },
        ]);

        expect(mockDbClient.selectFrom).toHaveBeenCalledWith('flagged_incidents as fi');
        expect(mockDbClient.groupBy).toHaveBeenCalledWith('fi.severity');
        expect(mockDbClient.where).toHaveBeenCalledWith('e.institution_id', 'in', ['inst-123']);
    });

    it('returns empty array percentage calculation if totalCount is zero', async () => {
        const mockExecute = vi.fn().mockResolvedValue([]);

        const mockDbClient = {
            selectFrom: vi.fn().mockReturnThis(),
            innerJoin: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            groupBy: vi.fn().mockReturnThis(),
            execute: mockExecute,
            fn: {
                count: vi.fn(),
            },
        } as any;

        const result = await getAnalyticsIncidentSeverityData(mockDbClient, {});
        expect(result).toEqual([]);
    });
});
