import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';
import { useExamReport } from './index';

const { mockApiClient, mockUseExamReportQuery, mockSearchParamsGet, mockRefetch } = vi.hoisted(
    () => ({
        mockApiClient: vi.fn(),
        mockUseExamReportQuery: vi.fn(),
        mockSearchParamsGet: vi.fn().mockReturnValue(null),
        mockRefetch: vi.fn().mockResolvedValue(undefined),
    }),
);

vi.mock('next/navigation', () => ({
    useSearchParams: () => ({
        get: mockSearchParamsGet,
    }),
}));

vi.mock('@sentinel/hooks', () => ({
    useApi: () => mockApiClient,
    useExamReportQuery: (examId: string, query: unknown) => mockUseExamReportQuery(examId, query),
}));

vi.mock('@sentinel/services', () => ({
    bulkFinalizeAttempts: vi.fn(),
}));

vi.mock('../../_components/columns', () => ({
    getColumns: () => [],
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('useExamReport', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockApiClient.mockResolvedValue({
            remediationExam: {
                examId: 'remediation-exam-1',
                title: 'Final Exam (Makeup)',
            },
            remediationSchedule: {
                scheduledDate: '2026-04-21T09:00:00.000Z',
            },
        });
        mockUseExamReportQuery.mockReturnValue({
            data: {
                sections: [],
                actionItems: {
                    review: [],
                    makeup: [
                        {
                            id: 'queue-1',
                            studentId: 'student-1',
                            attemptId: null,
                            studentNo: '2024-0001',
                            firstName: 'Ana',
                            lastName: 'Santos',
                            reason: 'Needs makeup',
                        },
                    ],
                    retake: [
                        {
                            id: 'queue-2',
                            studentId: 'student-2',
                            attemptId: 'attempt-2',
                            studentNo: '2024-0002',
                            firstName: 'Luis',
                            lastName: 'Reyes',
                            reason: 'Needs retake',
                        },
                    ],
                },
            },
            isLoading: false,
            isError: false,
            refetch: mockRefetch,
            isFetching: false,
        });
    });

    it('calls the makeup lifecycle endpoint from the report hook', async () => {
        const { result } = renderHook(() => useExamReport({ examId: 'exam-1' }));

        await act(async () => {
            await result.current.handleGrantOverride(
                result.current.actionQueues.makeup[0],
                'MAKEUP',
                '2026-04-21T09:00:00.000Z',
                '2026-04-21T11:00:00.000Z',
                'Approved makeup.',
            );
        });

        expect(mockApiClient).toHaveBeenCalledWith(
            '/exams/exam-1/students/student-1/lifecycle/grant-makeup',
            expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('"availableFrom":"2026-04-21T09:00:00.000Z"'),
            }),
        );
        expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Final Exam (Makeup)'));
        expect(mockRefetch).toHaveBeenCalled();
    });

    it('calls the retake lifecycle endpoint with the source attempt id', async () => {
        const { result } = renderHook(() => useExamReport({ examId: 'exam-1' }));

        await act(async () => {
            await result.current.handleGrantOverride(
                result.current.actionQueues.retake[0],
                'RETAKE',
                '2026-04-21T09:00:00.000Z',
                '2026-04-21T10:30:00.000Z',
                'Approved retake.',
            );
        });

        expect(mockApiClient).toHaveBeenCalledWith(
            '/exams/exam-1/students/student-2/lifecycle/grant-retake',
            expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('"sourceAttemptId":"attempt-2"'),
            }),
        );
        expect(toast.success).toHaveBeenCalled();
        expect(mockRefetch).toHaveBeenCalled();
    });
});
