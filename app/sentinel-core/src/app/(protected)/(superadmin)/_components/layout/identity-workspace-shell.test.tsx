import { render, screen, cleanup } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { IdentityWorkspaceShell } from './identity-workspace-shell';

const mockUsePathname = vi.fn();

vi.mock('next/navigation', () => ({
    usePathname: () => mockUsePathname(),
}));

vi.mock('./identity-nav', () => ({
    IdentityNav: ({ activeSection, role }: { activeSection: string; role?: string }) => (
        <div data-testid="identity-nav" data-active-section={activeSection} data-role={role ?? 'none'} />
    ),
}));

describe('IdentityWorkspaceShell Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('derives activeSection as administrators by default on /administrators', () => {
        mockUsePathname.mockReturnValue('/administrators');
        render(
            <IdentityWorkspaceShell role="superadmin">
                <div>Content</div>
            </IdentityWorkspaceShell>
        );

        const nav = screen.getAllByTestId('identity-nav')[0];
        expect(nav.getAttribute('data-active-section')).toBe('administrators');
        expect(nav.getAttribute('data-role')).toBe('superadmin');
    });

    it('derives activeSection as whitelist on /administrators/whitelist for superadmin', () => {
        mockUsePathname.mockReturnValue('/administrators/whitelist');
        render(
            <IdentityWorkspaceShell role="superadmin">
                <div>Content</div>
            </IdentityWorkspaceShell>
        );

        const nav = screen.getAllByTestId('identity-nav')[0];
        expect(nav.getAttribute('data-active-section')).toBe('whitelist');
        expect(nav.getAttribute('data-role')).toBe('superadmin');
    });

    it('derives activeSection as student-whitelist on /administrators/whitelist for admin', () => {
        mockUsePathname.mockReturnValue('/administrators/whitelist');
        render(
            <IdentityWorkspaceShell role="admin">
                <div>Content</div>
            </IdentityWorkspaceShell>
        );

        const nav = screen.getAllByTestId('identity-nav')[0];
        expect(nav.getAttribute('data-active-section')).toBe('student-whitelist');
        expect(nav.getAttribute('data-role')).toBe('admin');
    });

    it('derives activeSection as students on /administrators/students for admin', () => {
        mockUsePathname.mockReturnValue('/administrators/students');
        render(
            <IdentityWorkspaceShell role="admin">
                <div>Content</div>
            </IdentityWorkspaceShell>
        );

        const nav = screen.getAllByTestId('identity-nav')[0];
        expect(nav.getAttribute('data-active-section')).toBe('students');
    });

    it('derives activeSection as instructors on /administrators/instructors for admin', () => {
        mockUsePathname.mockReturnValue('/administrators/instructors');
        render(
            <IdentityWorkspaceShell role="admin">
                <div>Content</div>
            </IdentityWorkspaceShell>
        );

        const nav = screen.getAllByTestId('identity-nav')[0];
        expect(nav.getAttribute('data-active-section')).toBe('instructors');
    });

    it('derives activeSection as permissions on /permissions', () => {
        mockUsePathname.mockReturnValue('/permissions');
        render(
            <IdentityWorkspaceShell role="superadmin">
                <div>Content</div>
            </IdentityWorkspaceShell>
        );

        const nav = screen.getAllByTestId('identity-nav')[0];
        expect(nav.getAttribute('data-active-section')).toBe('permissions');
    });
});
