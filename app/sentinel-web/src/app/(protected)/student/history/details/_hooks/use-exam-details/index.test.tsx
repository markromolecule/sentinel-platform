import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@sentinel/services';
import { useExamDetails } from './index';

const { mockSearchParams } = vi.hoisted(() => ({
    mockSearchParams: {
        get: vi.fn((key: string) => (key === 'attemptId' ? 'attempt-1' : null)),
    },
}));

const mockHistoryDetailQuery = vi.fn();
const mockExamQuery = vi.fn();
const mockAttemptReportQuery = vi.fn();

vi.mock('next/navigation', () => ({
    useSearchParams: () => mockSearchParams,
}));

vi.mock('@sentinel/hooks', () => ({
    useExamHistoryDetailQuery: (...args: any[]) => mockHistoryDetailQuery(...args),
    useExamQuery: (...args: any[]) => mockExamQuery(...args),
    useAttemptReportQuery: (...args: any[]) => mockAttemptReportQuery(...args),
}));

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return function Wrapper({ children }: { children: ReactNode }) {
        return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    };
}

describe('useExamDetails', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockHistoryDetailQuery.mockReturnValue({
            data: {
                id: 'attempt-1',
                attemptId: 'attempt-1',
                examId: 'exam-1',
                examTitle: 'Essay Exam',
                subject: 'English',
                sectionName: null,
                status: 'turned_in',
                result: 'passed',
                availableAt: null,
                dueAt: null,
                completedAt: '2026-06-26T10:00:00.000Z',
                score: 8,
                totalScore: 10,
                percentage: 80,
                timeSpent: 50,
                cheated: false,
                cheatingType: null,
                incidentCount: 0,
                durationMinutes: 60,
                passingScore: 70,
                roomName: null,
            },
            isLoading: false,
        });
        mockExamQuery.mockReturnValue({
            data: undefined,
            isLoading: false,
        });
    });

    it('marks report availability as available when the attempt report loads', async () => {
        mockAttemptReportQuery.mockReturnValue({
            data: {
                attempt: {
                    attemptId: 'attempt-1',
                    examId: 'exam-1',
                    examTitle: 'Essay Exam',
                    subjectTitle: 'English',
                    studentId: 'student-1',
                    studentName: 'Student One',
                    studentNumber: '2026-0001',
                    completedAt: '2026-06-26T10:00:00.000Z',
                    score: 8,
                    totalScore: 10,
                    status: 'COMPLETED',
                    answers: {},
                    evaluations: {},
                    feedback: null,
                    itemOverrides: {},
                    grading: {
                        finalizedAt: '2026-06-26T11:00:00.000Z',
                        finalizedBy: 'user-1',
                    },
                    questionReports: [],
                },
                questions: [],
            },
            error: null,
            isLoading: false,
        });

        const { result } = renderHook(() => useExamDetails(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.reportAvailability).toBe('available');
        expect(result.current.report?.attempt.attemptId).toBe('attempt-1');
    });

    it('marks report availability as grading_in_progress on 409 responses', async () => {
        mockAttemptReportQuery.mockReturnValue({
            data: undefined,
            error: new ApiError({
                message: 'Still finalizing',
                status: 409,
                statusText: 'Conflict',
            }),
            isLoading: false,
        });

        const { result } = renderHook(() => useExamDetails(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.reportAvailability).toBe('grading_in_progress');
        expect(result.current.report).toBeUndefined();
    });
});
