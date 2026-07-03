import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMonitoring } from './use-monitoring';

const {
    mockUseApi,
    mockUseDebounce,
    mockUseStableValue,
    mockUseExamMonitoringOverviewQuery,
    mockUseOverrideReconnectLimitMutation,
} = vi.hoisted(() => ({
    mockUseApi: vi.fn(),
    mockUseDebounce: vi.fn((value: string) => value),
    mockUseStableValue: vi.fn((factory: () => unknown) => factory()),
    mockUseExamMonitoringOverviewQuery: vi.fn(),
    mockUseOverrideReconnectLimitMutation: vi.fn(),
}));

vi.mock('@sentinel/hooks', () => ({
    useApi: () => mockUseApi(),
    useDebounce: (value: string, delay: number) => mockUseDebounce(value, delay),
    useStableValue: (factory: () => unknown, deps: unknown[]) => mockUseStableValue(factory, deps),
    useExamMonitoringOverviewQuery: (examId: string) => mockUseExamMonitoringOverviewQuery(examId),
    useOverrideReconnectLimitMutation: (options: unknown) =>
        mockUseOverrideReconnectLimitMutation(options),
}));

vi.mock('@sentinel/services', () => ({
    updateExamRuntimeAccess: vi.fn(),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const monitoringOverview = {
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
            lastActivity: 'Now',
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
            lastActivity: 'Now',
        },
    ],
};

describe('useMonitoring', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseApi.mockReturnValue({ api: true });
        mockUseDebounce.mockImplementation((value: string) => value);
        mockUseStableValue.mockImplementation((factory: () => unknown) => factory());
        mockUseExamMonitoringOverviewQuery.mockReturnValue({
            data: monitoringOverview,
            isLoading: false,
            isFetching: false,
            isError: false,
            refetch: vi.fn(),
        });
        mockUseOverrideReconnectLimitMutation.mockReturnValue({
            mutateAsync: vi.fn(),
        });
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
});
