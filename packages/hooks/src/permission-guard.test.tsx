import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { PermissionGuard } from './permission-guard';
import { useActivePermissions } from './use-active-permissions';

// Mock the useActivePermissions hook
vi.mock('./use-active-permissions', () => ({
    useActivePermissions: vi.fn(),
}));

describe('PermissionGuard', () => {
    const mockHasPermission = vi.fn();
    const mockHasAnyPermission = vi.fn();
    const mockHasAllPermissions = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useActivePermissions).mockReturnValue({
            activePermissionKeys: [],
            hasPermission: mockHasPermission,
            hasAnyPermission: mockHasAnyPermission,
            hasAllPermissions: mockHasAllPermissions,
            isLoading: false,
        });
    });

    afterEach(() => {
        cleanup();
    });


    it('renders children if user has the required permission', () => {
        mockHasPermission.mockReturnValue(true);

        render(
            <PermissionGuard permission="test:permission">
                <div>Protected Content</div>
            </PermissionGuard>
        );

        expect(screen.getByText('Protected Content')).toBeDefined();
        expect(mockHasPermission).toHaveBeenCalledWith('test:permission');
    });

    it('renders fallback if user does not have the required permission', () => {
        mockHasPermission.mockReturnValue(false);

        render(
            <PermissionGuard
                permission="test:permission"
                fallback={<div>Fallback Content</div>}
            >
                <div>Protected Content</div>
            </PermissionGuard>
        );

        expect(screen.queryByText('Protected Content')).toBeNull();
        expect(screen.getByText('Fallback Content')).toBeDefined();
        expect(mockHasPermission).toHaveBeenCalledWith('test:permission');
    });

    it('renders children if user has any of the permissions (requireAll = false)', () => {
        mockHasAnyPermission.mockReturnValue(true);

        render(
            <PermissionGuard permissions={['p1', 'p2']} requireAll={false}>
                <div>Protected Content</div>
            </PermissionGuard>
        );

        expect(screen.getByText('Protected Content')).toBeDefined();
        expect(mockHasAnyPermission).toHaveBeenCalledWith(['p1', 'p2']);
    });

    it('renders fallback if user lacks any of the permissions (requireAll = false)', () => {
        mockHasAnyPermission.mockReturnValue(false);

        render(
            <PermissionGuard
                permissions={['p1', 'p2']}
                requireAll={false}
                fallback={<div>Fallback Content</div>}
            >
                <div>Protected Content</div>
            </PermissionGuard>
        );

        expect(screen.queryByText('Protected Content')).toBeNull();
        expect(screen.getByText('Fallback Content')).toBeDefined();
        expect(mockHasAnyPermission).toHaveBeenCalledWith(['p1', 'p2']);
    });

    it('renders children if user has all permissions (requireAll = true)', () => {
        mockHasAllPermissions.mockReturnValue(true);

        render(
            <PermissionGuard permissions={['p1', 'p2']} requireAll={true}>
                <div>Protected Content</div>
            </PermissionGuard>
        );

        expect(screen.getByText('Protected Content')).toBeDefined();
        expect(mockHasAllPermissions).toHaveBeenCalledWith(['p1', 'p2']);
    });

    it('renders fallback if user lacks some permissions (requireAll = true)', () => {
        mockHasAllPermissions.mockReturnValue(false);

        render(
            <PermissionGuard
                permissions={['p1', 'p2']}
                requireAll={true}
                fallback={<div>Fallback Content</div>}
            >
                <div>Protected Content</div>
            </PermissionGuard>
        );

        expect(screen.queryByText('Protected Content')).toBeNull();
        expect(screen.getByText('Fallback Content')).toBeDefined();
        expect(mockHasAllPermissions).toHaveBeenCalledWith(['p1', 'p2']);
    });

});
