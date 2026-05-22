import { describe, expect, it, vi } from 'vitest';
import { getAnalyticsIncidentTypeData } from './get-analytics-incident-type';

describe('getAnalyticsIncidentTypeData', () => {
    it('queries and returns incident type distribution correctly', async () => {
        const mockRows = [
            { type: 'TAB_SWITCH', count: 30 },
            { type: 'GAZE', count: 10 },
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

        const result = await getAnalyticsIncidentTypeData(mockDbClient, {
            institutionId: 'inst-123',
        });

        expect(result).toEqual([
            { type: 'TAB_SWITCH', count: 30, percentage: 75 },
            { type: 'GAZE', count: 10, percentage: 25 },
        ]);

        expect(mockDbClient.selectFrom).toHaveBeenCalledWith('flagged_incidents as fi');
        expect(mockDbClient.groupBy).toHaveBeenCalledWith('fi.incident_type');
    });
});
