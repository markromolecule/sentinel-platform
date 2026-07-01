'use client';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import HistoryDetailsPage from './page';

const mockUseExamDetails = vi.fn();

vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

vi.mock('@/app/(protected)/student/history/details/_hooks/use-exam-details', () => ({
    useExamDetails: () => mockUseExamDetails(),
}));

vi.mock('@/app/(protected)/student/history/details/_components/attempt-report-dialog', () => ({
    AttemptReportDialog: ({ open }: { open: boolean }) =>
        open ? <div>Detailed Report Dialog</div> : null,
}));

vi.mock('@/app/(protected)/student/history/details/_components/exam-detail-stats', () => ({
    ExamDetailStats: () => <div>Exam Detail Stats</div>,
}));

vi.mock('@/app/(protected)/student/history/details/_components/exam-header', () => ({
    ExamHeader: () => <div>Exam Header</div>,
}));

vi.mock('@/app/(protected)/student/history/details/_components/exam-hero-score', () => ({
    ExamHeroScore: () => <div>Exam Hero Score</div>,
}));

vi.mock('@/app/(protected)/student/history/details/_components/exam-info', () => ({
    ExamInfo: () => <div>Exam Info</div>,
}));

vi.mock('@/components/sidebar/student/CheatingReport', () => ({
    CheatingReport: () => <div>Cheating Report</div>,
}));

afterEach(() => {
    cleanup();
});

describe('HistoryDetailsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows released report copy and opens the report dialog when data is available', async () => {
        mockUseExamDetails.mockReturnValue({
            historyItem: {
                examTitle: 'Final Exam',
                subject: 'Algorithms',
                status: 'turned_in',
                completedAt: '2026-06-26T09:00:00.000Z',
                dueAt: null,
                availableAt: null,
                timeSpent: 45,
                score: null,
                totalScore: null,
                percentage: null,
                cheated: false,
                cheatingType: null,
                result: null,
            },
            report: {
                attempt: {},
                questions: [{ id: 'question-1' }],
            },
            reportAvailability: 'available',
            isLoading: false,
        });

        render(<HistoryDetailsPage />);

        expect(await screen.findByText('Detailed Report Available')).toBeTruthy();
        expect(screen.queryByText('Finalized Report Ready')).toBeNull();
        expect(screen.queryByText('Attempt Report View')).toBeNull();

        fireEvent.click(screen.getByRole('button', { name: /view detailed report/i }));

        expect(screen.getByText('Detailed Report Dialog')).toBeTruthy();
    });

    it('shows the in-review state when grading is still in progress', async () => {
        mockUseExamDetails.mockReturnValue({
            historyItem: {
                examTitle: 'Essay Exam',
                subject: 'English',
                status: 'turned_in',
                completedAt: '2026-06-26T09:00:00.000Z',
                dueAt: null,
                availableAt: null,
                timeSpent: 45,
                score: 18,
                totalScore: 20,
                percentage: 90,
                cheated: false,
                cheatingType: null,
                result: 'passed',
            },
            report: undefined,
            reportAvailability: 'grading_in_progress',
            isLoading: false,
        });

        render(<HistoryDetailsPage />);

        expect(await screen.findByText('Report In Review')).toBeTruthy();
        expect(screen.queryByText('Attempt Report View')).toBeNull();
    });
});
