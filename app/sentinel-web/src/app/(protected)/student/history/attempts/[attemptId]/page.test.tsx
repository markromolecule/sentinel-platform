import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import StudentHistoryAttemptPage from './page';

const mockHistoryDetailsContent = vi.fn();

vi.mock('@/app/(protected)/student/history/_components/history-details-content', () => ({
    HistoryDetailsContent: (props: Record<string, unknown>) => {
        mockHistoryDetailsContent(props);
        return <div>History Details Content</div>;
    },
}));

describe('StudentHistoryAttemptPage', () => {
    it('passes the attempt route param to the shared history details content', async () => {
        render(
            await StudentHistoryAttemptPage({
                params: Promise.resolve({
                    attemptId: 'attempt-1',
                }),
            }),
        );

        expect(screen.getByText('History Details Content')).toBeTruthy();
        expect(mockHistoryDetailsContent).toHaveBeenCalledWith({
            attemptId: 'attempt-1',
        });
    });
});
