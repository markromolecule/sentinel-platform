import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@sentinel/services';
import { useExamDetails } from './index';

const { mockSearchParams, searchParamValues } = vi.hoisted(() => ({
    searchParamValues: new Map<string, string | null>([['attemptId', 'attempt-1']]),
    mockSearchParams: {
        get: vi.fn((key: string) => searchParamValues.get(key) ?? null),
    },
}));

const mockHistoryDetailQuery = vi.fn();
const mockExamQuery = vi.fn();
const mockAttemptReportQuery = vi.fn();

vi.mock('next/navigation', () => ({
    useSearchParams: () => mockSearchParams,
}));

vi.mock('@sentinel/hooks', () => ({
    useExamHistoryDetailQuery: (...args: unknown[]) => mockHistoryDetailQuery(...args),
    useExamQuery: (...args: unknown[]) => mockExamQuery(...args),
    useAttemptReportQuery: (...args: unknown[]) => mockAttemptReportQuery(...args),
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
        searchParamValues.clear();
        searchParamValues.set('attemptId', 'attempt-1');
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
        mockAttemptReportQuery.mockReturnValue({
            data: undefined,
            error: null,
            isLoading: false,
        });
    });

    it('uses the explicit attempt route param when loading an attempt report', async () => {
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

        const { result } = renderHook(
            () => useExamDetails({ attemptId: 'attempt-route-1' }),
            {
                wrapper: createWrapper(),
            },
        );

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.reportAvailability).toBe('available');
        expect(result.current.attemptId).toBe('attempt-route-1');
        expect(result.current.report?.attempt.attemptId).toBe('attempt-1');
        expect(mockHistoryDetailQuery).toHaveBeenCalledWith('attempt-route-1');
        expect(mockAttemptReportQuery).toHaveBeenCalledWith('attempt-route-1');
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

    it('uses the explicit exam route param when no attempt id exists', async () => {
        searchParamValues.clear();
        searchParamValues.set('examId', 'search-exam-id');
        mockHistoryDetailQuery.mockReturnValue({
            data: undefined,
            isLoading: false,
        });
        mockExamQuery.mockReturnValue({
            data: {
                id: 'exam-1',
                attemptId: null,
                title: 'Upcoming Exam',
                subject: 'Science',
                section: null,
                scheduledDate: '2026-06-26T10:00:00.000Z',
                publishedAt: null,
                endDateTime: '2026-06-26T11:00:00.000Z',
                completedAt: null,
                score: null,
                totalScore: null,
                percentage: null,
                status: 'upcoming',
                passingScore: 70,
                timeSpentMinutes: null,
                cheated: false,
                cheatingType: null,
                incidentCount: 0,
                duration: 60,
                room: null,
            },
            isLoading: false,
        });
        mockAttemptReportQuery.mockReturnValue({
            data: undefined,
            error: null,
            isLoading: true,
        });

        const { result } = renderHook(() => useExamDetails({ examId: 'exam-route-1' }), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.attemptId).toBeNull();
        expect(result.current.examId).toBe('exam-route-1');
        expect(result.current.historyItem?.examId).toBe('exam-1');
        expect(result.current.reportAvailability).toBe('unavailable');
        expect(mockAttemptReportQuery).toHaveBeenCalledWith(null);
        expect(mockExamQuery).toHaveBeenCalledWith('exam-route-1');
    });

    it('exposes loading_report while the attempt report is still loading', async () => {
        mockAttemptReportQuery.mockReturnValue({
            data: undefined,
            error: null,
            isLoading: true,
        });

        const { result } = renderHook(() => useExamDetails(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.reportAvailability).toBe('loading_report');
        expect(result.current.report).toBeUndefined();
    });
});
