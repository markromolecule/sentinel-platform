import { describe, expect, it, vi } from 'vitest';
import { getAnalyticsReportsData } from './get-analytics-reports';

describe('getAnalyticsReportsData', () => {
    it('queries and returns paginated analytics reports correctly', async () => {
        const mockGeneratedAt = new Date('2026-05-22T10:00:00Z');
        const mockRecords = [
            {
                reportId: 'rep-1',
                title: 'Completion Report',
                type: 'completion',
                generatedAt: mockGeneratedAt,
                format: 'pdf',
                status: 'READY',
                fileUrl: 'http://test.com/1.pdf',
                createdBy: 'user-123',
                creatorFirstName: 'John',
                creatorLastName: 'Doe',
            },
        ];

        const mockExecuteTakeFirst = vi.fn().mockResolvedValue({ count: 1 });
        const mockExecute = vi.fn().mockResolvedValue(mockRecords);

        const mockDbClient = {
            selectFrom: vi.fn().mockReturnThis(),
            leftJoin: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            offset: vi.fn().mockReturnThis(),
            executeTakeFirst: mockExecuteTakeFirst,
            execute: mockExecute,
        } as any;

        const result = await getAnalyticsReportsData(mockDbClient, {
            institutionId: 'inst-123',
            limit: 5,
            page: 2,
        });

        expect(result).toEqual({
            records: [
                {
                    reportId: 'rep-1',
                    title: 'Completion Report',
                    type: 'completion',
                    generatedAt: mockGeneratedAt,
                    format: 'pdf',
                    status: 'READY',
                    fileUrl: 'http://test.com/1.pdf',
                    createdBy: 'user-123',
                    creatorFirstName: 'John',
                    creatorLastName: 'Doe',
                },
            ],
            total_records: 1,
            limit: 5,
            page: 2,
        });

        expect(mockDbClient.selectFrom).toHaveBeenCalledWith('analytics_reports as ar');
        expect(mockDbClient.leftJoin).toHaveBeenCalledWith(
            'user_profiles as up',
            'up.user_id',
            'ar.created_by',
        );
        expect(mockDbClient.limit).toHaveBeenCalledWith(5);
        expect(mockDbClient.offset).toHaveBeenCalledWith(5); // (2-1)*5 = 5
        expect(mockDbClient.where).toHaveBeenCalledWith('up.institution_id', '=', 'inst-123');
    });
});
