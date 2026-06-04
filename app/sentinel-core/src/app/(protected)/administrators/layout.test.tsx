import { render, screen, cleanup } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import AdministratorsLayout from './layout';

const mockUseUser = vi.fn();

vi.mock('@/hooks/use-user', () => ({
    useUser: () => mockUseUser(),
}));

vi.mock('@/app/(protected)/(superadmin)/_components/layout', () => ({
    IdentityWorkspaceShell: ({ children, role }: { children: React.ReactNode; role?: string }) => (
        <div data-testid="identity-shell" data-role={role ?? 'none'}>
            {children}
        </div>
    ),
}));

describe('AdministratorsLayout', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the IdentityWorkspaceShell with the user role and children', () => {
        mockUseUser.mockReturnValue({
            data: { id: 'admin-1', role: 'admin' },
            isLoading: false,
        });

        render(
            <AdministratorsLayout>
                <div data-testid="child-content">Child Content</div>
            </AdministratorsLayout>,
        );

        const shell = screen.getByTestId('identity-shell');
        expect(shell).toBeTruthy();
        expect(shell.getAttribute('data-role')).toBe('admin');
        expect(screen.getByTestId('child-content')).toBeTruthy();
    });

    it('renders IdentityWorkspaceShell with none role if user role is undefined', () => {
        mockUseUser.mockReturnValue({
            data: null,
            isLoading: false,
        });

        render(
            <AdministratorsLayout>
                <div data-testid="child-content">Child Content</div>
            </AdministratorsLayout>,
        );

        const shell = screen.getByTestId('identity-shell');
        expect(shell).toBeTruthy();
        expect(shell.getAttribute('data-role')).toBe('none');
    });
});
