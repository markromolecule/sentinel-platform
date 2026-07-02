import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AttemptGradingDetailType, GradingQuestionType } from '@sentinel/shared';
import { AttemptReportDialog } from './attempt-report-dialog';

const mockAttemptReportView = vi.fn();

vi.mock('@/features/exams/reports', () => ({
    AttemptReportView: (props: Record<string, unknown>) => {
        mockAttemptReportView(props);
        return <div>Attempt Report Table</div>;
    },
}));

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('AttemptReportDialog', () => {
    it('renders the released attempt report table in a dialog', () => {
        const attempt = {
            attemptId: 'attempt-1',
            grading: {
                finalizedAt: '2026-06-26T10:00:00.000Z',
            },
        };
        const questions = [{ id: 'question-1' }];

        render(
            <AttemptReportDialog
                open
                onOpenChange={vi.fn()}
                attempt={attempt as unknown as AttemptGradingDetailType}
                questions={questions as unknown as GradingQuestionType[]}
            />,
        );

        expect(screen.getByRole('dialog')).toBeTruthy();
        expect(screen.getByText('Detailed Report')).toBeTruthy();
        expect(screen.getByText('1 question')).toBeTruthy();
        expect(screen.getByText('Attempt Report Table')).toBeTruthy();
        expect(mockAttemptReportView).toHaveBeenCalledWith(
            expect.objectContaining({
                attempt,
                questions,
                showSummaryCards: false,
                showActions: false,
            }),
        );
    });
});
