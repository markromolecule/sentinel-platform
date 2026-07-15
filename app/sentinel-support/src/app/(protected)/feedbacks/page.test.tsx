'use client';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FeedbacksPage from './page';

const mockUseFeedbacksQuery = vi.fn();
const mockUseActivePermissions = vi.fn();

vi.mock('@sentinel/hooks', () => ({
    useActivePermissions: () => mockUseActivePermissions(),
    useDebounce: (value: string) => value,
    useFeedbacksQuery: (...args: unknown[]) => mockUseFeedbacksQuery(...args),
}));

vi.mock('@sentinel/ui', () => ({
    PageHeader: ({ title, description }: { title: string; description: string }) => (
        <div>
            <h1>{title}</h1>
            <p>{description}</p>
        </div>
    ),
    PermissionDeniedState: ({ resourceName }: { resourceName: string }) => (
        <div>Denied: {resourceName}</div>
    ),
    Separator: () => <hr />,
}));

vi.mock('./_components/feedback-summary-cards', () => ({
    FeedbackSummaryCards: () => <div>FeedbackSummaryCards</div>,
}));

vi.mock('./_components/feedbacks-table', () => ({
    FeedbacksTable: () => <div>FeedbacksTable</div>,
}));

vi.mock('./_components/feedback-detail-dialog', () => ({
    FeedbackDetailDialog: () => <div>FeedbackDetailDialog</div>,
}));

describe('FeedbacksPage', () => {
    it('renders a permission denied state when feedback access is unavailable', () => {
        mockUseActivePermissions.mockReturnValue({
            hasPermission: () => false,
        });

        render(<FeedbacksPage />);

        expect(screen.getByText('Denied: feedback')).toBeTruthy();
    });

    it('renders the feedback workspace when permission is granted', () => {
        mockUseActivePermissions.mockReturnValue({
            hasPermission: () => true,
        });
        mockUseFeedbacksQuery.mockReturnValue({
            data: {
                items: [],
                page: 1,
                pageSize: 10,
                total: 0,
                totalPages: 0,
                hasMore: false,
            },
            isLoading: false,
        });

        render(<FeedbacksPage />);

        expect(screen.getByText('Feedback')).toBeTruthy();
        expect(screen.getByText('FeedbackSummaryCards')).toBeTruthy();
        expect(screen.getByText('FeedbacksTable')).toBeTruthy();
    });
});
