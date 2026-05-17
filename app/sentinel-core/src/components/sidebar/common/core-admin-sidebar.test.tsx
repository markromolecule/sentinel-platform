import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CoreAdminSidebar } from './core-admin-sidebar';

const mockUseSidebar = vi.fn();
const mockUseDashboardNav = vi.fn();
const mockUseCoreAdminCapabilities = vi.fn();

vi.mock('@sentinel/ui', () => ({
    Sidebar: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    SidebarContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    SidebarGroup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    SidebarGroupContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    SidebarMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    SidebarRail: () => <div data-testid="sidebar-rail" />,
    SidebarSeparator: () => <hr data-testid="sidebar-separator" />,
    useSidebar: () => mockUseSidebar(),
}));

vi.mock('./hooks/use-dashboard-nav', () => ({
    useDashboardNav: () => mockUseDashboardNav(),
}));

vi.mock('@/hooks/use-core-admin-capabilities', () => ({
    useCoreAdminCapabilities: () => mockUseCoreAdminCapabilities(),
}));

vi.mock('./dashboard-sidebar-item', () => ({
    DashboardSidebarItem: ({
        item,
        sidebarState,
    }: {
        item: { title: string };
        sidebarState: 'expanded' | 'collapsed';
    }) => <div>{`${item.title}:${sidebarState}`}</div>,
}));

describe('CoreAdminSidebar', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockUseSidebar.mockReturnValue({
            state: 'expanded',
            setOpen: vi.fn(),
        });
        mockUseDashboardNav.mockReturnValue({
            pathname: '/dashboard',
            openMenus: {},
            toggleMenu: vi.fn(),
            isChildActive: vi.fn(() => false),
        });
    });

    it('renders only the visible centralized navigation items', () => {
        mockUseCoreAdminCapabilities.mockReturnValue({
            visibleNavigationSections: [
                {
                    label: 'Overview',
                    showSeparator: true,
                    items: [
                        {
                            title: 'Overview',
                            url: '/dashboard',
                            icon: () => null,
                        },
                    ],
                },
                {
                    label: 'Management',
                    showSeparator: true,
                    items: [
                        {
                            title: 'Users',
                            url: '/users',
                            icon: () => null,
                        },
                    ],
                },
            ],
        });

        render(<CoreAdminSidebar />);

        expect(screen.getByText('Overview:expanded')).toBeTruthy();
        expect(screen.getByText('Users:expanded')).toBeTruthy();
        expect(screen.getAllByTestId('sidebar-separator')).toHaveLength(1);
    });

    it('passes the current sidebar state down to each rendered item', () => {
        mockUseSidebar.mockReturnValue({
            state: 'collapsed',
            setOpen: vi.fn(),
        });
        mockUseCoreAdminCapabilities.mockReturnValue({
            visibleNavigationSections: [
                {
                    label: 'Overview',
                    showSeparator: true,
                    items: [
                        {
                            title: 'Reports & Analytics',
                            url: '/analytics',
                            icon: () => null,
                        },
                    ],
                },
            ],
        });

        render(<CoreAdminSidebar />);

        expect(screen.getByText('Reports & Analytics:collapsed')).toBeTruthy();
    });

    it('renders the Academic Setup item and its sub-items when visible', () => {
        mockUseCoreAdminCapabilities.mockReturnValue({
            visibleNavigationSections: [
                {
                    label: 'Management',
                    showSeparator: true,
                    items: [
                        {
                            title: 'Academic Setup',
                            url: '/departments',
                            icon: () => null,
                            subItems: [
                                { title: 'Departments', url: '/departments' },
                                { title: 'Semesters', url: '/semesters' },
                            ],
                        },
                    ],
                },
            ],
        });

        render(<CoreAdminSidebar />);

        expect(screen.getByText('Academic Setup:expanded')).toBeTruthy();
    });
});
