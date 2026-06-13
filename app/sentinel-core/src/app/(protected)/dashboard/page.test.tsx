// @vitest-environment jsdom
import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';

afterEach(() => {
    cleanup();
});

// --- Mock all heavy dependencies before importing the page ---

vi.mock('@/hooks/use-user', () => ({
    useUser: vi.fn(),
}));

vi.mock('@/app/(protected)/dashboard/_stores/use-dashboard-layout-store', () => ({
    useDashboardLayoutStore: vi.fn((selector) =>
        selector({
            layoutItems: [],
            reorderWidgets: vi.fn(),
        }),
    ),
}));

vi.mock('@sentinel/hooks', () => ({
    useInstitutionsQuery: () => ({ data: [] }),
    useDepartmentsQuery: () => ({ data: [] }),
    useCoursesQuery: () => ({ data: [] }),
    useRoomsQuery: () => ({ data: [] }),
    useSubjectsQuery: () => ({ data: [] }),
    useSectionsQuery: () => ({ data: [] }),
    useAnnouncementsQuery: () => ({ data: null, isLoading: false }),
    useProfileQuery: vi.fn(),
}));

vi.mock('@dnd-kit/core', () => ({
    DndContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    PointerSensor: class {},
    KeyboardSensor: class {},
    closestCenter: vi.fn(),
    useSensor: vi.fn(),
    useSensors: vi.fn(() => []),
}));

vi.mock('@dnd-kit/sortable', () => ({
    SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    verticalListSortingStrategy: {},
    sortableKeyboardCoordinates: {},
    arrayMove: vi.fn(),
}));

vi.mock('@sentinel/ui', async () => {
    const actual = await vi.importActual<typeof import('@sentinel/ui')>('@sentinel/ui');
    return {
        ...actual,
        PageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
        Calendar: () => <div data-testid="calendar" />,
        Separator: () => <hr />,
    };
});

vi.mock('@sentinel/shared/constants', () => ({
    MOCK_EXAM_COMPLETION_DATA: [],
    MOCK_INCIDENT_TRENDS: [],
    MOCK_RECENT_ACTIVITY: [],
    MOCK_SYSTEM_STATS: [],
    MOCK_PLATFORM_ACTIVITY: [],
}));

// Mock all dashboard widget components so they don't cascade into their own deps
vi.mock('@/app/(protected)/dashboard/_components', () => ({
    ActiveSessionsWidget: () => <div>ActiveSessionsWidget</div>,
    AdminStatsCards: () => <div>AdminStatsCards</div>,
    ChartGroupPanel: () => <div>ChartGroupPanel</div>,
    DashboardGreeting: ({ fullName }: { fullName: string }) => (
        <div data-testid="dashboard-greeting">Hello {fullName}</div>
    ),
    DashboardShell: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="dashboard-shell">{children}</div>
    ),
    DashboardWidgetWrapper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    FlaggedIncidentsWidget: () => <div>FlaggedIncidentsWidget</div>,
    KpiCarouselWidget: () => <div>KpiCarouselWidget</div>,
    RecentInstitutionsWidget: () => <div>RecentInstitutionsWidget</div>,
    SuperadminStatsCards: () => <div>SuperadminStatsCards</div>,
    SystemActivityWidget: () => <div>SystemActivityWidget</div>,
    SystemHealth: () => <div>SystemHealth</div>,
}));

import { useUser } from '@/hooks/use-user';
import { useProfileQuery } from '@sentinel/hooks';

const mockUseUser = vi.mocked(useUser);
const mockUseProfileQuery = vi.mocked(useProfileQuery);

import DashboardPage from './page';

describe('DashboardPage', () => {
    it('renders DashboardGreeting for the superadmin role', () => {
        mockUseUser.mockReturnValue({
            data: {
                role: 'superadmin',
                user_metadata: { full_name: 'Joseph Cruz' },
                email: 'j@test.com',
            },
            isLoading: false,
        } as unknown as ReturnType<typeof useUser>);
        mockUseProfileQuery.mockReturnValue({
            profile: { firstName: 'Joseph', lastName: 'Cruz', email: 'j@test.com' },
            isLoading: false,
        } as unknown as ReturnType<typeof useProfileQuery>);

        render(<DashboardPage />);

        expect(screen.getByTestId('dashboard-greeting')).toBeDefined();
        expect(screen.getByTestId('dashboard-shell')).toBeDefined();
    });

    it('renders DashboardGreeting for the admin role', () => {
        mockUseUser.mockReturnValue({
            data: {
                role: 'admin',
                user_metadata: { full_name: 'Admin User' },
                email: 'admin@test.com',
            },
            isLoading: false,
        } as unknown as ReturnType<typeof useUser>);
        mockUseProfileQuery.mockReturnValue({
            profile: { firstName: 'Admin', lastName: 'User', email: 'admin@test.com' },
            isLoading: false,
        } as unknown as ReturnType<typeof useProfileQuery>);

        render(<DashboardPage />);

        expect(screen.getByTestId('dashboard-greeting')).toBeDefined();
        expect(screen.getByTestId('dashboard-shell')).toBeDefined();
    });

    it('renders a loading message while user data is loading', () => {
        mockUseUser.mockReturnValue({
            data: undefined,
            isLoading: true,
        } as unknown as ReturnType<typeof useUser>);
        mockUseProfileQuery.mockReturnValue({
            profile: undefined,
            isLoading: false,
        } as unknown as ReturnType<typeof useProfileQuery>);

        render(<DashboardPage />);
        expect(screen.getByRole('status')).toBeDefined();
    });

    it('renders a loading message while profile data is loading', () => {
        mockUseUser.mockReturnValue({
            data: { role: 'admin' },
            isLoading: false,
        } as unknown as ReturnType<typeof useUser>);
        mockUseProfileQuery.mockReturnValue({
            profile: undefined,
            isLoading: true,
        } as unknown as ReturnType<typeof useProfileQuery>);

        render(<DashboardPage />);
        expect(screen.getByRole('status')).toBeDefined();
    });
});
