import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PermissionGate } from './permission-gate';

const mockUseCoreAdminCapabilities = vi.fn();

vi.mock('@/hooks/use-core-admin-capabilities', () => ({
    useCoreAdminCapabilities: () => mockUseCoreAdminCapabilities(),
}));

describe('PermissionGate', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders children if permission is pre-evaluated to true', () => {
        mockUseCoreAdminCapabilities.mockReturnValue({
            canViewPage: () => false,
            canEditPage: () => false,
        });

        render(
            <PermissionGate permission={true}>
                <div>Allowed Content</div>
            </PermissionGate>
        );

        expect(screen.getByText('Allowed Content')).toBeTruthy();
    });

    it('renders children if the user has edit permission for the page', () => {
        mockUseCoreAdminCapabilities.mockReturnValue({
            canViewPage: () => true,
            canEditPage: (page: string) => page === 'users',
        });

        render(
            <PermissionGate permission="users" action="edit">
                <div>Editable Content</div>
            </PermissionGate>
        );

        expect(screen.getByText('Editable Content')).toBeTruthy();
    });

    it('hides children and renders nothing when permission is missing in default hide mode', () => {
        mockUseCoreAdminCapabilities.mockReturnValue({
            canViewPage: () => false,
            canEditPage: () => false,
        });

        const { container } = render(
            <PermissionGate permission="users" action="edit">
                <div>Secret Content</div>
            </PermissionGate>
        );

        expect(screen.queryByText('Secret Content')).toBeNull();
        expect(container.firstChild).toBeNull();
    });

    it('renders fallback when permission is missing in hide mode and fallback is provided', () => {
        mockUseCoreAdminCapabilities.mockReturnValue({
            canViewPage: () => false,
            canEditPage: () => false,
        });

        render(
            <PermissionGate
                permission="users"
                action="edit"
                fallback={<div>Fallback Copy</div>}
            >
                <div>Secret Content</div>
            </PermissionGate>
        );

        expect(screen.queryByText('Secret Content')).toBeNull();
        expect(screen.getByText('Fallback Copy')).toBeTruthy();
    });

    it('disables interactive element if permission is missing in disable mode', () => {
        mockUseCoreAdminCapabilities.mockReturnValue({
            canViewPage: () => false,
            canEditPage: () => false,
        });

        render(
            <PermissionGate permission="users" action="edit" mode="disable">
                <button>Action Button</button>
            </PermissionGate>
        );

        const button = screen.getByRole('button', { name: /Action Button/i });
        expect(button.getAttribute('disabled')).not.toBeNull();
        expect(button.getAttribute('aria-disabled')).toBe('true');
    });

    it('sets readOnly attribute and disables child element if permission is missing in readonly mode', () => {
        mockUseCoreAdminCapabilities.mockReturnValue({
            canViewPage: () => false,
            canEditPage: () => false,
        });

        render(
            <PermissionGate permission="users" action="edit" mode="readonly">
                <input placeholder="Secret Input" />
            </PermissionGate>
        );

        const input = screen.getByPlaceholderText('Secret Input');
        expect(input.getAttribute('readonly')).not.toBeNull();
        expect(input.getAttribute('aria-readonly')).toBe('true');
    });

    it('provides disabled/readOnly state to a children function', () => {
        mockUseCoreAdminCapabilities.mockReturnValue({
            canViewPage: () => false,
            canEditPage: () => false,
        });

        render(
            <PermissionGate permission="users" action="edit" mode="disable">
                {({ disabled }) => (
                    <div>State: {disabled ? 'disabled' : 'enabled'}</div>
                )}
            </PermissionGate>
        );

        expect(screen.getByText('State: disabled')).toBeTruthy();
    });
});
