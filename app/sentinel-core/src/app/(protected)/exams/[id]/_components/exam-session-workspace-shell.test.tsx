import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ExamSessionWorkspaceShell } from './exam-session-workspace-shell';

const mockPathname = vi.hoisted(() => vi.fn());
const mockUseParams = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
    usePathname: () => mockPathname(),
    useParams: () => mockUseParams(),
}));

vi.mock('./exam-session-nav', () => ({
    ExamSessionNav: ({ examId }: { examId: string }) => (
        <div data-exam-id={examId} data-testid="exam-session-nav" />
    ),
}));

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('ExamSessionWorkspaceShell', () => {
    it('renders the runtime sidebar for lobby routes', () => {
        mockPathname.mockReturnValue('/exams/exam-1/lobby');
        mockUseParams.mockReturnValue({ id: 'exam-1' });

        render(
            <ExamSessionWorkspaceShell>
                <div data-testid="shell-child">Content</div>
            </ExamSessionWorkspaceShell>,
        );

        expect(screen.getByRole('heading', { name: 'Exam Session' })).toBeTruthy();
        expect(screen.getAllByTestId('exam-session-nav')[0]?.getAttribute('data-exam-id')).toBe(
            'exam-1',
        );
        expect(screen.getByTestId('shell-child')).toBeTruthy();
    });

    it('renders the runtime sidebar for report routes', () => {
        mockPathname.mockReturnValue('/exams/exam-1/report');
        mockUseParams.mockReturnValue({ id: 'exam-1' });

        render(
            <ExamSessionWorkspaceShell>
                <div data-testid="shell-child">Content</div>
            </ExamSessionWorkspaceShell>,
        );

        expect(screen.getByRole('heading', { name: 'Report Sections' })).toBeTruthy();
        expect(screen.getAllByTestId('exam-session-nav')[0]?.getAttribute('data-exam-id')).toBe(
            'exam-1',
        );
        expect(screen.getByTestId('shell-child')).toBeTruthy();
    });

    it('renders the runtime sidebar for logs routes', () => {
        mockPathname.mockReturnValue('/exams/exam-1/logs');
        mockUseParams.mockReturnValue({ id: 'exam-1' });

        render(
            <ExamSessionWorkspaceShell>
                <div data-testid="shell-child">Content</div>
            </ExamSessionWorkspaceShell>,
        );

        expect(screen.getByRole('heading', { name: 'Exam Session' })).toBeTruthy();
        expect(screen.getAllByTestId('exam-session-nav')[0]?.getAttribute('data-exam-id')).toBe(
            'exam-1',
        );
        expect(screen.getByTestId('shell-child')).toBeTruthy();
    });

    it('renders children without the runtime sidebar for builder routes', () => {
        mockPathname.mockReturnValue('/exams/exam-1/builder');
        mockUseParams.mockReturnValue({ id: 'exam-1' });

        render(
            <ExamSessionWorkspaceShell>
                <div data-testid="shell-child">Content</div>
            </ExamSessionWorkspaceShell>,
        );

        expect(screen.queryByRole('heading', { name: 'Exam Session' })).toBeNull();
        expect(screen.queryByTestId('exam-session-nav')).toBeNull();
        expect(screen.getByTestId('shell-child')).toBeTruthy();
    });
});
