// @vitest-environment jsdom
import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import ProctorDashboardPage from './page';

afterEach(() => {
    cleanup();
});

// Mock hooks
vi.mock('@/app/(protected)/(instructor)/dashboard/_hooks/use-proctor-dashboard', () => ({
    useProctorDashboard: () => ({
        stats: [],
        recentExams: [],
        recentStudents: [],
    }),
}));

vi.mock('@sentinel/hooks', () => ({
    useProfileQuery: vi.fn(),
    useAnnouncementsQuery: () => ({ data: null, isLoading: false }),
}));

vi.mock('@sentinel/ui', async () => {
    const actual = await vi.importActual<typeof import('@sentinel/ui')>('@sentinel/ui');
    return {
        ...actual,
        Calendar: () => <div data-testid="calendar" />,
        Separator: () => <hr data-testid="separator" />,
    };
});

// Mock local dashboard components to prevent deep dependency issues
vi.mock('@/app/(protected)/(instructor)/dashboard/_components', () => ({
    DashboardShell: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="dashboard-shell">{children}</div>
    ),
    DashboardGreeting: ({ fullName }: { fullName: string }) => (
        <div data-testid="dashboard-greeting">Hello {fullName}</div>
    ),
    DashboardStats: () => <div data-testid="dashboard-stats">Stats</div>,
    RecentExams: () => <div data-testid="recent-exams">Recent Exams</div>,
    RecentStudents: () => <div data-testid="recent-students">Recent Students</div>,
    QuickActions: () => <div data-testid="quick-actions">Quick Actions</div>,
}));

import { useProfileQuery } from '@sentinel/hooks';
const mockUseProfileQuery = vi.mocked(useProfileQuery);

describe('ProctorDashboardPage', () => {
    it('renders loading dashboard state when profile is loading', () => {
        mockUseProfileQuery.mockReturnValue({
            profile: undefined,
            isLoading: true,
        } as unknown as ReturnType<typeof useProfileQuery>);

        render(<ProctorDashboardPage />);
        expect(screen.getByText('Loading dashboard...')).toBeDefined();
    });

    it('renders dashboard shell, greeting, and layout components after loading', () => {
        mockUseProfileQuery.mockReturnValue({
            profile: { firstName: 'Jane', lastName: 'Doe', email: 'jane@test.com' },
            isLoading: false,
        } as unknown as ReturnType<typeof useProfileQuery>);

        render(<ProctorDashboardPage />);

        expect(screen.getByTestId('dashboard-shell')).toBeDefined();
        expect(screen.getByTestId('dashboard-greeting')).toBeDefined();
        expect(screen.getByText('Hello Jane Doe')).toBeDefined();
        expect(screen.getByTestId('dashboard-stats')).toBeDefined();
        expect(screen.getByTestId('recent-exams')).toBeDefined();
        expect(screen.getByTestId('recent-students')).toBeDefined();
        expect(screen.getByTestId('quick-actions')).toBeDefined();
    });

    it('falls back to email when name is not available', () => {
        mockUseProfileQuery.mockReturnValue({
            profile: { email: 'jane.doe@example.com' },
            isLoading: false,
        } as unknown as ReturnType<typeof useProfileQuery>);

        render(<ProctorDashboardPage />);
        expect(screen.getByText('Hello jane.doe@example.com')).toBeDefined();
    });
});
