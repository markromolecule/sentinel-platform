import { render, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ProtectedLayout from './layout';

vi.mock('next/navigation', () => ({
    usePathname: () => '/',
}));

vi.mock('@sentinel/ui', () => ({
    SidebarProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="sidebar-provider">{children}</div>
    ),
    SidebarInset: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="sidebar-inset">{children}</div>
    ),
    cn: (...inputs: any[]) => inputs.filter(Boolean).join(' '),
}));


vi.mock('@/components/sidebar/support/support-header', () => ({
    SupportHeader: () => <div data-testid="support-header">Support Header</div>,
}));

vi.mock('@/components/sidebar/support/support-sidebar', () => ({
    SuperAdminSidebar: () => <div data-testid="support-sidebar">Support Sidebar</div>,
}));

describe('ProtectedLayout (sentinel-support)', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders the sidebar and header immediately without waiting for auth', () => {
        const { getByTestId } = render(
            <ProtectedLayout>
                <div>Page Content</div>
            </ProtectedLayout>,
        );

        expect(getByTestId('support-header')).toBeTruthy();
        expect(getByTestId('support-sidebar')).toBeTruthy();
    });

    it('renders children immediately without an isLoading gate', () => {
        const { getByText } = render(
            <ProtectedLayout>
                <div>Page Content</div>
            </ProtectedLayout>,
        );

        expect(getByText('Page Content')).toBeTruthy();
    });

    it('does not render a loading spinner', () => {
        const { container } = render(
            <ProtectedLayout>
                <div>Page Content</div>
            </ProtectedLayout>,
        );

        // The old layout blocked rendering behind a spinner; confirm it's gone
        expect(container.querySelector('.animate-spin')).toBeNull();
    });
});
