import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import StudentHistoryExamPage from './page';

const mockHistoryDetailsContent = vi.fn();

vi.mock('@/app/(protected)/student/history/_components/history-details-content', () => ({
    HistoryDetailsContent: (props: Record<string, unknown>) => {
        mockHistoryDetailsContent(props);
        return <div>History Details Content</div>;
    },
}));

describe('StudentHistoryExamPage', () => {
    it('passes the exam route param to the shared history details content', async () => {
        render(
            await StudentHistoryExamPage({
                params: Promise.resolve({
                    examId: 'exam-1',
                }),
            }),
        );

        expect(screen.getByText('History Details Content')).toBeTruthy();
        expect(mockHistoryDetailsContent).toHaveBeenCalledWith({
            examId: 'exam-1',
        });
    });
});
