import { render, cleanup } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import ProtectedLayout from './layout';

const mockUseUser = vi.fn();
const mockUseCoreAdminCapabilities = vi.fn();

vi.mock('@/hooks/use-user', () => ({
    useUser: () => mockUseUser(),
}));

vi.mock('@/hooks/use-core-admin-capabilities', () => ({
    useCoreAdminCapabilities: () => mockUseCoreAdminCapabilities(),
}));

vi.mock('@sentinel/ui', () => ({
    SidebarProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="sidebar-provider">{children}</div>
    ),
    SidebarInset: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="sidebar-inset">{children}</div>
    ),
}));

vi.mock('@/components/sidebar/admin/admin-header', () => ({
    AdminHeader: () => <div data-testid="admin-header">Admin Header</div>,
}));

vi.mock('@/components/sidebar/common/core-admin-sidebar', () => ({
    CoreAdminSidebar: () => <div data-testid="admin-sidebar">Admin Sidebar</div>,
}));

describe('ProtectedLayout', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders loading spinner when user data is loading', () => {
        mockUseUser.mockReturnValue({
            data: null,
            isLoading: true,
        });
        mockUseCoreAdminCapabilities.mockReturnValue({
            canViewPage: () => false,
        });

        const { container, queryByText } = render(
            <ProtectedLayout>
                <div>Page Content</div>
            </ProtectedLayout>,
        );

        expect(container.querySelector('.animate-spin')).toBeTruthy();
        expect(queryByText('Page Content')).toBeNull();
    });

    it('renders children and sidebars when authorized user (role admin) is loaded', () => {
        mockUseUser.mockReturnValue({
            data: { id: 'admin-1', role: 'admin' },
            isLoading: false,
        });
        mockUseCoreAdminCapabilities.mockReturnValue({
            canViewPage: () => true,
        });

        const { getByTestId, getByText } = render(
            <ProtectedLayout>
                <div>Page Content</div>
            </ProtectedLayout>,
        );

        expect(getByTestId('admin-header')).toBeTruthy();
        expect(getByTestId('admin-sidebar')).toBeTruthy();
        expect(getByText('Page Content')).toBeTruthy();
    });

    it('renders children when user can view overview page even if role is undefined', () => {
        mockUseUser.mockReturnValue({
            data: { id: 'user-1' },
            isLoading: false,
        });
        mockUseCoreAdminCapabilities.mockReturnValue({
            canViewPage: (page: string) => page === 'overview',
        });

        const { getByText } = render(
            <ProtectedLayout>
                <div>Page Content</div>
            </ProtectedLayout>,
        );

        expect(getByText('Page Content')).toBeTruthy();
    });

    it('hides children when user has no admin role and cannot view overview', () => {
        mockUseUser.mockReturnValue({
            data: { id: 'student-1', role: 'student' },
            isLoading: false,
        });
        mockUseCoreAdminCapabilities.mockReturnValue({
            canViewPage: () => false,
        });

        const { queryByText } = render(
            <ProtectedLayout>
                <div>Page Content</div>
            </ProtectedLayout>,
        );

        expect(queryByText('Page Content')).toBeNull();
    });
});
