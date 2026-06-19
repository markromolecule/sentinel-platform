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

vi.mock('@/hooks/use-academic-scope', () => ({
    useAcademicScope: vi.fn(),
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
    useCoursesQuery: vi.fn(() => ({ data: [], isLoading: false })),
    useRoomsQuery: () => ({ data: [] }),
    useSubjectsQuery: () => ({ data: [] }),
    useSectionsQuery: vi.fn(() => ({ data: [], isLoading: false })),
    useAnnouncementsQuery: () => ({ data: null, isLoading: false }),
    useProfileQuery: vi.fn(),
    useUsersQuery: vi.fn(() => ({ data: [], isLoading: false })),
    useClassroomsQuery: vi.fn(() => ({ data: [], isLoading: false })),
    useStudentWhitelistQuery: vi.fn(() => ({ data: [], isLoading: false })),
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
        Spinner: () => <div role="status">Loading...</div>,
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
    KpiCarouselWidget: () => <div data-testid="kpi-carousel">KpiCarouselWidget</div>,
    RecentInstitutionsWidget: () => <div>RecentInstitutionsWidget</div>,
    SuperadminStatsCards: () => <div>SuperadminStatsCards</div>,
    SystemActivityWidget: () => <div>SystemActivityWidget</div>,
    SystemHealth: () => <div>SystemHealth</div>,
    AdminShortcutsWidget: () => <div data-testid="admin-shortcuts">AdminShortcutsWidget</div>,
}));

import { useUser } from '@/hooks/use-user';
import { useAcademicScope } from '@/hooks/use-academic-scope';
import { useProfileQuery } from '@sentinel/hooks';

const mockUseUser = vi.mocked(useUser);
const mockUseAcademicScope = vi.mocked(useAcademicScope);
const mockUseProfileQuery = vi.mocked(useProfileQuery);

import DashboardPage from './page';

describe('DashboardPage', () => {
    it('renders DashboardGreeting and scoped widgets for the superadmin role', () => {
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
        mockUseAcademicScope.mockReturnValue({
            role: 'superadmin',
            isSuperadmin: true,
            isAdmin: false,
            assignedDepartmentId: 'dept-123',
            assignedCourseId: '',
            institutionId: 'inst-123',
            isLoading: false,
        } as any);

        render(<DashboardPage />);

        expect(screen.getByTestId('dashboard-greeting')).toBeDefined();
        expect(screen.getByTestId('dashboard-shell')).toBeDefined();
        expect(screen.getByTestId('kpi-carousel')).toBeDefined();
        expect(screen.getByTestId('admin-shortcuts')).toBeDefined();
    });

    it('renders DashboardGreeting and scoped widgets for the admin role', () => {
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
        mockUseAcademicScope.mockReturnValue({
            role: 'admin',
            isSuperadmin: false,
            isAdmin: true,
            assignedDepartmentId: '',
            assignedCourseId: 'course-123',
            institutionId: 'inst-123',
            isLoading: false,
        } as any);

        render(<DashboardPage />);

        expect(screen.getByTestId('dashboard-greeting')).toBeDefined();
        expect(screen.getByTestId('dashboard-shell')).toBeDefined();
        expect(screen.getByTestId('kpi-carousel')).toBeDefined();
        expect(screen.getByTestId('admin-shortcuts')).toBeDefined();
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
        mockUseAcademicScope.mockReturnValue({
            isLoading: false,
        } as any);

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
        mockUseAcademicScope.mockReturnValue({
            isLoading: false,
        } as any);

        render(<DashboardPage />);
        expect(screen.getByRole('status')).toBeDefined();
    });

    it('renders a loading message while academic scope is loading', () => {
        mockUseUser.mockReturnValue({
            data: { role: 'admin' },
            isLoading: false,
        } as unknown as ReturnType<typeof useUser>);
        mockUseProfileQuery.mockReturnValue({
            profile: { firstName: 'Admin', lastName: 'User' },
            isLoading: false,
        } as any);
        mockUseAcademicScope.mockReturnValue({
            isLoading: true,
        } as any);

        render(<DashboardPage />);
        expect(screen.getByRole('status')).toBeDefined();
    });
});
