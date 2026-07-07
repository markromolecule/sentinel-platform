import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ExamMonitoringPage from './page';
import { ExamSessionWorkspaceShell } from '../_components/exam-session-workspace-shell';

const { mockPush, mockUseMonitoring } = vi.hoisted(() => ({
    mockPush: vi.fn(),
    mockUseMonitoring: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    useParams: () => ({ id: 'exam-1' }),
    usePathname: () => '/exams/exam-1/monitoring',
    useRouter: () => ({ push: mockPush }),
    useSearchParams: () => new URLSearchParams(),
}));

vi.mock('./_hooks/use-monitoring', () => ({
    useMonitoring: (examId: string) => mockUseMonitoring(examId),
}));

vi.mock('@/features/exams', () => ({
    MonitoringHeader: ({ examTitle }: { examTitle: string }) => (
        <div data-testid="monitoring-header">{examTitle}</div>
    ),
    MonitoringStats: () => <div data-testid="monitoring-stats" />,
    StudentList: ({ onSelect }: { onSelect: (student: { id: string }) => void }) => (
        <button type="button" onClick={() => onSelect({ id: 'student-1' })}>
            Open Student
        </button>
    ),
}));

vi.mock('./_components/runtime-access-dialogs', () => ({
    RuntimeAccessDialogs: () => <div data-testid="runtime-access-dialogs" />,
}));

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('ExamMonitoringPage', () => {
    it('renders in the runtime shell and routes selected students to detail pages', () => {
        mockUseMonitoring.mockReturnValue({
            monitoring: {
                exam: {
                    title: 'Biology Midterm',
                    subject: 'Biology',
                    maxReconnectAttempts: 3,
                },
                stats: {
                    total: 1,
                    active: 1,
                    flagged: 0,
                    submitted: 0,
                },
                lobbyAdmissions: {
                    waiting: 0,
                    approved: 0,
                    inAttempt: 1,
                },
            },
            isLoading: false,
            isFetching: false,
            isError: false,
            filteredStudents: [],
            searchQuery: '',
            filterStatus: 'all',
            page: 1,
            pageSize: 8,
            isUpdatingAccess: false,
            pendingAction: null,
            isReopenDialogOpen: false,
            reopenMinutes: '30',
            overridingStudentId: null,
            setPendingAction: vi.fn(),
            setIsReopenDialogOpen: vi.fn(),
            setReopenMinutes: vi.fn(),
            setPage: vi.fn(),
            handleSearchChange: vi.fn(),
            handleFilterChange: vi.fn(),
            handleConfirmAction: vi.fn(),
            handleSubmitReopen: vi.fn(),
            handleOverrideReconnect: vi.fn(),
            refetch: vi.fn(),
        });

        render(
            <ExamSessionWorkspaceShell>
                <ExamMonitoringPage />
            </ExamSessionWorkspaceShell>,
        );

        expect(screen.getByRole('heading', { name: 'Exam Session' })).toBeTruthy();
        expect(screen.getByTestId('monitoring-header')).toBeTruthy();

        fireEvent.click(screen.getByRole('button', { name: 'Open Student' }));

        expect(mockPush).toHaveBeenCalledWith('/exams/exam-1/monitoring/student-1');
    });
});
