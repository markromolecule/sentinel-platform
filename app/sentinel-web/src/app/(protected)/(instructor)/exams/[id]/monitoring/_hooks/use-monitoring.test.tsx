import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMonitoring } from './use-monitoring';

const {
    mockUseCloseExamAttemptMutation,
    mockUseApi,
    mockUseDebounce,
    mockUseStableValue,
    mockUseExamMonitoringOverviewQuery,
    mockUseGrantMakeupExamWindowMutation,
    mockUseGrantRetakeExamWindowMutation,
    mockUseLockExamAttemptMutation,
    mockUseOverrideReconnectLimitMutation,
    mockUseReopenExamAttemptMutation,
    mockUseResetExamAttemptMutation,
} = vi.hoisted(() => ({
    mockUseCloseExamAttemptMutation: vi.fn(),
    mockUseApi: vi.fn(),
    mockUseDebounce: vi.fn((value: string) => value),
    mockUseStableValue: vi.fn((factory: () => unknown) => factory()),
    mockUseExamMonitoringOverviewQuery: vi.fn(),
    mockUseGrantMakeupExamWindowMutation: vi.fn(),
    mockUseGrantRetakeExamWindowMutation: vi.fn(),
    mockUseLockExamAttemptMutation: vi.fn(),
    mockUseOverrideReconnectLimitMutation: vi.fn(),
    mockUseReopenExamAttemptMutation: vi.fn(),
    mockUseResetExamAttemptMutation: vi.fn(),
}));

vi.mock('@sentinel/hooks', () => ({
    useCloseExamAttemptMutation: (options?: unknown) => mockUseCloseExamAttemptMutation(options),
    useApi: () => mockUseApi(),
    useDebounce: (value: string, delay: number) => mockUseDebounce(value, delay),
    useStableValue: (factory: () => unknown, deps: unknown[]) => mockUseStableValue(factory, deps),
    useExamMonitoringOverviewQuery: (examId: string) => mockUseExamMonitoringOverviewQuery(examId),
    useGrantMakeupExamWindowMutation: (options?: unknown) =>
        mockUseGrantMakeupExamWindowMutation(options),
    useGrantRetakeExamWindowMutation: (options?: unknown) =>
        mockUseGrantRetakeExamWindowMutation(options),
    useLockExamAttemptMutation: (options?: unknown) => mockUseLockExamAttemptMutation(options),
    useOverrideReconnectLimitMutation: (options: unknown) =>
        mockUseOverrideReconnectLimitMutation(options),
    useReopenExamAttemptMutation: (options?: unknown) => mockUseReopenExamAttemptMutation(options),
    useResetExamAttemptMutation: (options?: unknown) => mockUseResetExamAttemptMutation(options),
}));

vi.mock('@sentinel/services', () => ({
    updateExamRuntimeAccess: vi.fn(),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        warning: vi.fn(),
    },
}));

const monitoringOverview: any = {
    exam: {
        id: 'exam-1',
        title: 'Biology Midterm',
        subject: 'Biology',
    },
    stats: {
        total: 2,
        active: 2,
        flagged: 0,
        submitted: 0,
    },
    lobbyAdmissions: {
        waiting: 0,
        approved: 0,
        inAttempt: 2,
    },
    students: [
        {
            id: 'student-1',
            attemptId: 'attempt-1',
            studentNo: '2026-001',
            firstName: 'Pat',
            lastName: 'Student',
            status: 'active',
            progress: 10,
            incidentCount: 0,
            openIncidentCount: 0,
            latestIncidentType: null,
            lastActivity: 'Now',
            lifecycleState: 'IN_PROGRESS',
        },
        {
            id: 'student-2',
            attemptId: 'attempt-2',
            studentNo: '2026-002',
            firstName: 'Alex',
            lastName: 'Learner',
            status: 'active',
            progress: 20,
            incidentCount: 0,
            openIncidentCount: 0,
            latestIncidentType: null,
            lastActivity: 'Now',
            lifecycleState: 'LOCKED',
        },
    ],
};

describe('useMonitoring', () => {
    let currentMonitoringOverview: any;

    beforeEach(() => {
        vi.clearAllMocks();
        currentMonitoringOverview = structuredClone(monitoringOverview);
        mockUseApi.mockReturnValue({ api: true });
        mockUseDebounce.mockImplementation((value: string) => value);
        mockUseStableValue.mockImplementation((factory: () => unknown) => factory());
        mockUseExamMonitoringOverviewQuery.mockImplementation(() => ({
            data: currentMonitoringOverview,
            isLoading: false,
            isFetching: false,
            isError: false,
            refetch: vi.fn(),
        }));
        mockUseOverrideReconnectLimitMutation.mockReturnValue({
            mutateAsync: vi.fn(),
        });
        for (const mock of [
            mockUseLockExamAttemptMutation,
            mockUseReopenExamAttemptMutation,
            mockUseResetExamAttemptMutation,
            mockUseCloseExamAttemptMutation,
            mockUseGrantMakeupExamWindowMutation,
            mockUseGrantRetakeExamWindowMutation,
        ]) {
            mock.mockReturnValue({
                mutateAsync: vi.fn(),
            });
        }
    });

    it('debounces the monitoring search query', () => {
        const { result } = renderHook(() => useMonitoring('exam-1'));

        act(() => {
            result.current.handleSearchChange('pat');
        });

        expect(mockUseDebounce).toHaveBeenLastCalledWith('pat', 500);
    });

    it('updates the controlled search value and resets page to 1', () => {
        const { result } = renderHook(() => useMonitoring('exam-1'));

        act(() => {
            result.current.setPage(2);
        });
        act(() => {
            result.current.handleSearchChange('pat');
        });

        expect(result.current.searchQuery).toBe('pat');
        expect(result.current.page).toBe(1);
    });

    it('filters students with the debounced value instead of the raw value', () => {
        mockUseDebounce.mockImplementation((value: string) => (value === 'pat' ? 'alex' : value));

        const { result } = renderHook(() => useMonitoring('exam-1'));

        act(() => {
            result.current.handleSearchChange('pat');
        });

        expect(result.current.searchQuery).toBe('pat');
        expect(result.current.filteredStudents.map((student) => student.id)).toEqual(['student-2']);
    });

    it('warns only when incident counts increase after the initial load', async () => {
        const { toast } = await import('sonner');
        const { rerender } = renderHook(() => useMonitoring('exam-1'));

        expect(toast.warning).not.toHaveBeenCalled();

        currentMonitoringOverview = {
            ...currentMonitoringOverview,
            students: currentMonitoringOverview.students.map((student) =>
                student.attemptId === 'attempt-1'
                    ? {
                          ...student,
                          incidentCount: 1,
                          openIncidentCount: 1,
                          latestIncidentType: 'TAB_SWITCH',
                      }
                    : student,
            ),
        };

        rerender();

        await waitFor(() => {
            expect(toast.warning).toHaveBeenCalledTimes(1);
        });
        expect(toast.warning).toHaveBeenCalledWith('New proctoring incident detected.', {
            description: 'Pat Student received TAB_SWITCH.',
        });

        rerender();

        expect(toast.warning).toHaveBeenCalledTimes(1);
    });

    it('routes per-student lifecycle actions through the dedicated mutation hooks', async () => {
        const lockMutateAsync = vi.fn().mockResolvedValue(undefined);
        mockUseLockExamAttemptMutation.mockReturnValue({
            mutateAsync: lockMutateAsync,
        });

        const { result } = renderHook(() => useMonitoring('exam-1'));

        await act(async () => {
            await result.current.handleLifecycleAction(
                currentMonitoringOverview.students[0],
                'lock',
            );
        });

        expect(lockMutateAsync).toHaveBeenCalledWith({
            id: 'exam-1',
            attemptId: 'attempt-1',
            reasonCode: 'MANUAL_MONITORING_LOCK',
            notes: 'Locked from instructor monitoring.',
        });
    });
});
