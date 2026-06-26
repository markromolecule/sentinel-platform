import { describe, expect, it, vi } from 'vitest';
import { getExamReport } from './reporting';

describe('getExamReport', () => {
    it('includes pagination and filters in the report query string', async () => {
        const apiClient = vi.fn().mockResolvedValue({
            data: {
                exam: {
                    id: 'exam-1',
                    title: 'Final Exam',
                    subject: 'Algorithms',
                    scheduledDate: null,
                    endDateTime: null,
                    durationMinutes: 60,
                    passingScore: 75,
                },
                summary: {
                    totalAssignedStudents: 0,
                    totalStarted: 0,
                    totalSubmitted: 0,
                    totalAbsent: 0,
                    flaggedStudentsCount: 0,
                    averageScore: null,
                    passRate: null,
                    incidentBreakdownByType: [],
                    incidentBreakdownBySeverity: [],
                    needsReviewCount: 0,
                    needsMakeupCount: 0,
                    needsRetakeCount: 0,
                },
                sections: [],
                students: [],
                studentsPagination: {
                    page: 2,
                    pageSize: 10,
                    total: 0,
                    totalPages: 0,
                    hasMore: false,
                },
                actionItems: {
                    review: [],
                    makeup: [],
                    retake: [],
                },
            },
        });

        await getExamReport(apiClient as any, 'exam-1', {
            search: 'ana',
            sectionId: 'section-1',
            page: 2,
            pageSize: 10,
        });

        expect(apiClient).toHaveBeenCalledWith(
            '/exams/exam-1/report?search=ana&sectionId=section-1&page=2&pageSize=10',
        );
    });
});
