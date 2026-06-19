import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SupportActivityFeedWidget } from './support-activity-feed-widget';

const mockRefetch = vi.fn();

vi.mock('@sentinel/hooks', () => ({
    useActivityLogsQuery: vi.fn(),
}));

import { useActivityLogsQuery } from '@sentinel/hooks';
const mockUseActivityLogsQuery = vi.mocked(useActivityLogsQuery);

describe('SupportActivityFeedWidget', () => {
    it('renders loading state correctly', () => {
        mockUseTelemetryQuery(true, undefined);

        render(<SupportActivityFeedWidget />);
        expect(screen.getByText('Loading activity...')).toBeDefined();
    });

    it('renders empty state when items are empty', () => {
        mockUseTelemetryQuery(false, { items: [], total: 0 });

        render(<SupportActivityFeedWidget />);
        expect(screen.getByText('No recent system activity recorded.')).toBeDefined();
    });

    it('renders list of activity logs correctly', () => {
        mockUseTelemetryQuery(false, {
            items: [
                {
                    logId: 'log-1',
                    userId: 'user-abc',
                    action: 'create_institution',
                    resourceType: 'institution',
                    createdAt: new Date().toISOString(),
                    userFirstName: 'John',
                    userLastName: 'Doe',
                },
                {
                    logId: 'log-2',
                    userId: 'user-xyz',
                    action: 'update_role',
                    resourceType: 'user',
                    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
                    userFirstName: 'Jane',
                    userLastName: 'Smith',
                },
            ],
            total: 2,
        });

        render(<SupportActivityFeedWidget />);

        expect(screen.getByText('System Activity Feed')).toBeDefined();
        expect(screen.getByText('John Doe')).toBeDefined();
        expect(screen.getByText('create_institution')).toBeDefined();
        expect(screen.getByText('institution')).toBeDefined();
        expect(screen.getByText('Jane Smith')).toBeDefined();
        expect(screen.getByText('update_role')).toBeDefined();
        expect(screen.getByText('user')).toBeDefined();
        expect(screen.getByText('1h ago')).toBeDefined();
    });

    it('calls refetch on refresh click', () => {
        mockUseTelemetryQuery(false, { items: [], total: 0 });

        render(<SupportActivityFeedWidget />);

        const refreshBtn = screen.getByRole('button', { name: /refresh activity feed/i });
        fireEvent.click(refreshBtn);

        expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
});

function mockUseTelemetryQuery(isLoading: boolean, data: any) {
    mockUseActivityLogsQuery.mockReturnValue({
        isLoading,
        data,
        isRefetching: false,
        refetch: mockRefetch,
    } as any);
}
