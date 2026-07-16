import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SuperAdminSidebar } from './support-sidebar';

const mockUseSidebar = vi.fn();
const mockUseDashboardNav = vi.fn();

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

vi.mock('../common/hooks/use-dashboard-nav', () => ({
    useDashboardNav: () => mockUseDashboardNav(),
}));

vi.mock('@sentinel/hooks', () => ({
    useConversationsQuery: vi.fn(() => ({
        data: [
            { conversationId: '1', unreadCount: 2, participants: [] },
            { conversationId: '2', unreadCount: 3, participants: [] },
        ],
    })),
    useActivePermissions: vi.fn(() => ({
        hasAnyPermission: () => true,
    })),
    useMessageRealtime: vi.fn(),
}));

vi.mock('../common/dashboard-sidebar-item', () => ({
    DashboardSidebarItem: ({
        item,
        pathname,
        isChildActive,
    }: {
        item: {
            title: string;
            url: string;
            subItems?: { title: string; url: string }[];
        };
        pathname: string;
        isChildActive: (url: string) => boolean;
    }) => {
        const isActive =
            pathname === item.url ||
            pathname.startsWith(`${item.url}/`) ||
            item.subItems?.some((subItem) => isChildActive(subItem.url)) ||
            false;

        return (
            <div
                data-testid="sidebar-item"
                data-url={item.url}
                data-active={isActive ? 'true' : 'false'}
            >
                <span>{item.title}</span>
                {item.subItems?.map((subItem) => (
                    <span
                        key={subItem.url}
                        data-child-url={subItem.url}
                        data-child-active={isChildActive(subItem.url) ? 'true' : 'false'}
                    >
                        {subItem.title}
                    </span>
                ))}
            </div>
        );
    },
}));

describe('SuperAdminSidebar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseSidebar.mockReturnValue({
            state: 'expanded',
            setOpen: vi.fn(),
        });
    });

    it('renders the Analytics & Logs route items with the correct urls', () => {
        mockUseDashboardNav.mockReturnValue({
            pathname: '/dashboard',
            openMenus: {},
            toggleMenu: vi.fn(),
            isChildActive: (url: string) => url === '/dashboard',
        });

        render(<SuperAdminSidebar />);

        expect(screen.getByTestId('sidebar-rail')).toBeTruthy();
        expect(screen.getAllByTestId('sidebar-separator')).toHaveLength(6);

        const items = screen.getAllByTestId('sidebar-item');
        const analyticsItem = items.find((item) => item.getAttribute('data-url') === '/analytics');
        const logsItem = items.find((item) => item.getAttribute('data-url') === '/logs');
        const feedbackItem = items.find((item) => item.getAttribute('data-url') === '/feedbacks');
        const pdfTemplatesItem = items.find(
            (item) => item.getAttribute('data-url') === '/pdf-templates',
        );

        expect(analyticsItem).toBeTruthy();
        expect(logsItem).toBeTruthy();
        expect(feedbackItem).toBeTruthy();
        expect(pdfTemplatesItem).toBeTruthy();

        expect(analyticsItem?.getAttribute('data-url')).toBe('/analytics');
        expect(logsItem?.getAttribute('data-url')).toBe('/logs');
        expect(feedbackItem?.getAttribute('data-url')).toBe('/feedbacks');
        expect(pdfTemplatesItem?.getAttribute('data-url')).toBe('/pdf-templates');
    });

    it('marks the analytics branch active when the pathname is under /analytics', () => {
        mockUseDashboardNav.mockReturnValue({
            pathname: '/analytics/incidents',
            openMenus: {},
            toggleMenu: vi.fn(),
            isChildActive: (url: string) => url === '/analytics' || url === '/analytics/incidents',
        });

        render(<SuperAdminSidebar />);

        const items = screen.getAllByTestId('sidebar-item');
        const analyticsItem = items.find((item) => item.getAttribute('data-url') === '/analytics');
        const logsItem = items.find((item) => item.getAttribute('data-url') === '/logs');

        expect(analyticsItem?.getAttribute('data-active')).toBe('true');
        expect(logsItem?.getAttribute('data-active')).toBe('false');
    });

    it('marks the logs branch active when the pathname is under /logs', () => {
        mockUseDashboardNav.mockReturnValue({
            pathname: '/logs/system',
            openMenus: {},
            toggleMenu: vi.fn(),
            isChildActive: (url: string) => url === '/logs' || url === '/logs/system',
        });

        render(<SuperAdminSidebar />);

        const items = screen.getAllByTestId('sidebar-item');
        const analyticsItem = items.find((item) => item.getAttribute('data-url') === '/analytics');
        const logsItem = items.find((item) => item.getAttribute('data-url') === '/logs');
        const feedbackItem = items.find((item) => item.getAttribute('data-url') === '/feedbacks');

        expect(logsItem?.getAttribute('data-active')).toBe('true');
        expect(analyticsItem?.getAttribute('data-active')).toBe('false');
        expect(feedbackItem?.getAttribute('data-active')).toBe('false');
    });

    it('marks the feedback branch active when the pathname is under /feedbacks', () => {
        mockUseDashboardNav.mockReturnValue({
            pathname: '/feedbacks',
            openMenus: {},
            toggleMenu: vi.fn(),
            isChildActive: (url: string) => url === '/feedbacks',
        });

        render(<SuperAdminSidebar />);

        const items = screen.getAllByTestId('sidebar-item');
        const feedbackItem = items.find((item) => item.getAttribute('data-url') === '/feedbacks');

        expect(feedbackItem?.getAttribute('data-active')).toBe('true');
    });
});
