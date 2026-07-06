import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RoleMatrixTable } from './role-matrix-table';

const sortedRoles = [
    {
        id: 1,
        name: 'Support',
        slug: 'support',
        description: 'Support role',
        isSystem: true,
        domainScope: ['support'],
        isActive: true,
        assignableBy: [],
        permissionSyncMode: 'BLUEPRINT' as const,
        permissionIds: ['perm-1'],
        permissionCount: 1,
        assignmentCount: 4,
        createdAt: null,
        updatedAt: null,
    },
    {
        id: 2,
        name: 'Admin',
        slug: 'admin',
        description: 'Admin role',
        isSystem: true,
        domainScope: ['core'],
        isActive: true,
        assignableBy: [],
        permissionSyncMode: 'CUSTOM' as const,
        permissionIds: ['perm-1'],
        permissionCount: 1,
        assignmentCount: 2,
        createdAt: null,
        updatedAt: null,
    },
    {
        id: 3,
        name: 'Reviewer',
        slug: 'reviewer',
        description: 'Custom role',
        isSystem: false,
        domainScope: ['app'],
        isActive: true,
        assignableBy: [],
        permissionSyncMode: 'CUSTOM' as const,
        permissionIds: [],
        permissionCount: 0,
        assignmentCount: 0,
        createdAt: null,
        updatedAt: null,
    },
];

describe('RoleMatrixTable', () => {
    it('renders sync-mode badges and only shows reset for customized system roles', () => {
        const onSetRoleToDelete = vi.fn();
        const onSetRoleToReset = vi.fn();

        render(
            <RoleMatrixTable
                sortedRoles={sortedRoles}
                groupedPermissions={[]}
                draftPermissionIdsByRoleId={{
                    1: ['perm-1'],
                    2: ['perm-1'],
                    3: [],
                }}
                savingRoleIds={[]}
                collapsedCategoryKeys={{}}
                collapsedModuleKeys={{}}
                editingRoleId={null}
                editingRoleName=""
                onToggleCategory={vi.fn()}
                onToggleModule={vi.fn()}
                onPermissionToggle={vi.fn()}
                onStartRoleNameEdit={vi.fn()}
                onSubmitRoleNameEdit={vi.fn()}
                onSetEditingRoleId={vi.fn()}
                onSetEditingRoleName={vi.fn()}
                onSetRoleToDelete={onSetRoleToDelete}
                onSetRoleToReset={onSetRoleToReset}
            />,
        );

        expect(screen.getByText('BLUEPRINT')).toBeDefined();
        expect(screen.getByText('CUSTOM')).toBeDefined();
        expect(screen.queryByText('Reset')).toBeTruthy();
        expect(screen.queryByText('Delete')).toBeTruthy();

        fireEvent.click(screen.getByText('Reset'));
        expect(onSetRoleToReset).toHaveBeenCalledWith(sortedRoles[1]);

        fireEvent.click(screen.getByText('Delete'));
        expect(onSetRoleToDelete).toHaveBeenCalledWith(sortedRoles[2]);
    });
});
