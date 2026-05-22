import { describe, expect, it, vi } from 'vitest';
import { createAnalyticsReportData } from './create-analytics-report';

describe('createAnalyticsReportData', () => {
    it('inserts and returns newly created report record correctly', async () => {
        const mockGeneratedAt = new Date();
        const mockCreatedReport = {
            report_id: 'rep-999',
            title: 'New Report',
            type: 'incident',
            generated_at: mockGeneratedAt,
            format: 'csv',
            status: 'READY',
            file_url: null,
            created_by: 'user-777',
        };

        const mockExecuteTakeFirstOrThrow = vi.fn().mockResolvedValue(mockCreatedReport);

        const mockDbClient = {
            insertInto: vi.fn().mockReturnThis(),
            values: vi.fn().mockReturnThis(),
            returningAll: vi.fn().mockReturnThis(),
            executeTakeFirstOrThrow: mockExecuteTakeFirstOrThrow,
        } as any;

        const result = await createAnalyticsReportData(mockDbClient, {
            title: 'New Report',
            type: 'incident',
            format: 'csv',
            createdBy: 'user-777',
        });

        expect(result).toEqual({
            report_id: 'rep-999',
            title: 'New Report',
            type: 'incident',
            generated_at: mockGeneratedAt,
            format: 'csv',
            status: 'READY',
            file_url: null,
            created_by: 'user-777',
        });

        expect(mockDbClient.insertInto).toHaveBeenCalledWith('analytics_reports');
        expect(mockDbClient.values).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'New Report',
                type: 'incident',
                format: 'csv',
                status: 'READY',
                created_by: 'user-777',
            }),
        );
    });
});
