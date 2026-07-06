import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type DbClient } from '@sentinel/db';
import { resolveExaminationGlobalSettings } from '../../configuration/configuration.service';
import { getExamReportsList } from './get-exam-reports-list';

vi.mock('../../configuration/configuration.service', () => ({
    resolveExaminationGlobalSettings: vi.fn(),
}));

vi.mock('../../exams/services/map-exam-response.service', () => ({
    mapExamSummaryResponse: vi.fn((record) => record),
}));

describe('getExamReportsList', () => {
    let mockDb: any;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(resolveExaminationGlobalSettings).mockResolvedValue({
            defaultDurationMinutes: 60,
            defaultPassingScore: 68,
        } as any);

        mockDb = {
            selectFrom: vi.fn().mockReturnThis(),
            leftJoin: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            offset: vi.fn().mockReturnThis(),
            as: vi.fn().mockReturnThis(),
            execute: vi.fn(),
            executeTakeFirst: vi.fn(),
        };
    });

    it('successfully queries reportable exams with limit and offset', async () => {
        mockDb.executeTakeFirst.mockResolvedValue({ total_count: 12 });
        mockDb.execute.mockResolvedValue([
            {
                exam_id: 'exam-1',
                title: 'Math Test',
                duration_minutes: 60,
                passing_score: null,
                status: 'PUBLISHED',
            },
        ]);

        const result = await getExamReportsList({
            dbClient: mockDb as DbClient,
            filters: {
                page: 2,
                limit: 5,
            },
            role: 'instructor',
            userId: 'instructor-1',
            institutionId: 'inst-1',
        });

        expect(mockDb.selectFrom).toHaveBeenCalledWith('exams as e');
        expect(mockDb.limit).toHaveBeenCalledWith(5);
        expect(mockDb.offset).toHaveBeenCalledWith(5);
        expect(result.total).toBe(12);
        expect(result.totalPages).toBe(3);
        expect(result.data[0].exam_id).toBe('exam-1');
        expect(result.data[0].passing_score).toBe(68);
    });
});
