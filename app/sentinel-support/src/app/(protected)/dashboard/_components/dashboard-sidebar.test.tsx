// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DashboardSidebar } from './dashboard-sidebar';

// Mock @sentinel/hooks to control announcement data
vi.mock('@sentinel/hooks', () => ({
    useAnnouncementsQuery: vi.fn(),
}));

// Mock @sentinel/ui — pass through real components except Calendar to keep tests simple
vi.mock('@sentinel/ui', async () => {
    const actual = await vi.importActual<typeof import('@sentinel/ui')>('@sentinel/ui');
    return {
        ...actual,
        // Render Calendar as a simple div so JSDOM doesn't need react-day-picker internals
        Calendar: () => <div data-testid="calendar-widget" />,
    };
});

// Mock next/link
vi.mock('next/link', () => ({
    default: ({
        href,
        children,
        ...rest
    }: {
        href: string;
        children: React.ReactNode;
        [key: string]: unknown;
    }) => (
        <a href={href} {...rest}>
            {children}
        </a>
    ),
}));

import { useAnnouncementsQuery } from '@sentinel/hooks';
const mockUseAnnouncementsQuery = vi.mocked(useAnnouncementsQuery);

const buildQueryResult = (data: unknown[] = [], isLoading = false) =>
    ({
        data: { data, meta: { total: data.length, page: 1, limit: 3, totalPages: 1 } },
        isLoading,
        isError: false,
    }) as ReturnType<typeof useAnnouncementsQuery>;

describe('DashboardSidebar', () => {
    it('renders the "Calendar" section heading', () => {
        mockUseAnnouncementsQuery.mockReturnValue(buildQueryResult([]));
        render(<DashboardSidebar />);
        expect(screen.getByText('Calendar')).toBeDefined();
    });

    it('renders the shadcn Calendar widget', () => {
        mockUseAnnouncementsQuery.mockReturnValue(buildQueryResult([]));
        render(<DashboardSidebar />);
        expect(screen.getByTestId('calendar-widget')).toBeDefined();
    });

    it('renders the "Announcements" section heading', () => {
        mockUseAnnouncementsQuery.mockReturnValue(buildQueryResult([]));
        render(<DashboardSidebar />);
        expect(screen.getByText('Announcements')).toBeDefined();
    });

    it('renders the empty state message when there are no announcements', () => {
        mockUseAnnouncementsQuery.mockReturnValue(buildQueryResult([]));
        render(<DashboardSidebar />);
        expect(screen.getByText('No announcements yet.')).toBeDefined();
    });

    it('renders announcement titles when data is present', () => {
        mockUseAnnouncementsQuery.mockReturnValue(
            buildQueryResult([
                {
                    id: '1',
                    title: 'System Maintenance Tonight',
                    published_at: '2026-06-09T00:00:00Z',
                },
                {
                    id: '2',
                    title: 'New Policy Update',
                    published_at: '2026-06-08T00:00:00Z',
                },
            ]),
        );
        render(<DashboardSidebar />);
        expect(screen.getByText('System Maintenance Tonight')).toBeDefined();
        expect(screen.getByText('New Policy Update')).toBeDefined();
    });

    it('renders the "View all →" link with href /announcements', () => {
        mockUseAnnouncementsQuery.mockReturnValue(buildQueryResult([]));
        render(<DashboardSidebar />);
        const link = screen.getByRole('link', { name: 'View all →' });
        expect(link).toBeDefined();
        expect(link.getAttribute('href')).toBe('/announcements');
    });
});
