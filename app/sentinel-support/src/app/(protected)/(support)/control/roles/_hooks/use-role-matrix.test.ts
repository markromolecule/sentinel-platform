import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useRoleMatrix } from './use-role-matrix';
import * as sentinelHooks from '@sentinel/hooks';

vi.mock('@sentinel/hooks', () => ({
    useAccessControlRolesQuery: vi.fn(),
    useAccessControlPermissionsQuery: vi.fn(),
    useCreateAccessControlRoleMutation: vi.fn(),
    useUpdateAccessControlRoleMutation: vi.fn(),
    useDeleteAccessControlRoleMutation: vi.fn(),
    useReplaceAccessControlRolePermissionsMutation: vi.fn(),
    useDebounce: vi.fn((val) => val),
    useStableValue: vi.fn((fn) => fn()),
}));

const mockRoles = [
    {
        id: 1,
        name: 'Admin',
        slug: 'admin',
        description: 'Admin role',
        isSystem: false,
        domainScope: ['app'],
        isActive: true,
        assignableBy: [],
        permissionIds: ['perm-1'],
        permissionCount: 1,
        assignmentCount: 0,
        createdAt: null,
        updatedAt: null,
    },
];

const mockPermissions = [
    {
        id: 'perm-1',
        permissionKey: 'module:action',
        name: 'Perm 1',
        description: '',
        category: 'module',
        moduleKey: 'module',
        actionKey: 'action',
        scope: '',
        isSystem: false,
        createdAt: null,
        updatedAt: null,
    },
    {
        id: 'perm-2',
        permissionKey: 'module:write',
        name: 'Perm 2',
        description: '',
        category: 'module',
        moduleKey: 'module',
        actionKey: 'write',
        scope: '',
        isSystem: false,
        createdAt: null,
        updatedAt: null,
    },
];

describe('useRoleMatrix hook', () => {
    let mockMutateAsync: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockMutateAsync = vi.fn().mockResolvedValue({});

        vi.mocked(sentinelHooks.useAccessControlRolesQuery).mockReturnValue({
            data: mockRoles,
            isLoading: false,
            error: null,
        } as any);

        vi.mocked(sentinelHooks.useAccessControlPermissionsQuery).mockReturnValue({
            data: mockPermissions,
            isLoading: false,
            error: null,
        } as any);

        vi.mocked(sentinelHooks.useReplaceAccessControlRolePermissionsMutation).mockReturnValue({
            mutateAsync: mockMutateAsync,
            isPending: false,
        } as any);
    });

    it('initializes roles, permissions, and draft states correctly', () => {
        const { result } = renderHook(() => useRoleMatrix());

        expect(result.current.roles).toEqual(mockRoles);
        expect(result.current.permissions).toEqual(mockPermissions);
        expect(result.current.draftPermissionIdsByRoleId[1]).toEqual(['perm-1']);
    });

    it('toggles permission and triggers mutation', async () => {
        const { result } = renderHook(() => useRoleMatrix());

        // Toggle perm-2 ON
        await act(async () => {
            result.current.handlePermissionToggle(1, 'perm-2', true);
        });

        // The hook uses a useEffect with debouncedDraftPermissionIdsByRoleId.
        // Since we mocked useDebounce to be immediate, it will trigger saveRolePermissions.
        expect(mockMutateAsync).toHaveBeenCalledWith({
            roleId: 1,
            permissionIds: ['perm-1', 'perm-2'],
        });
    });

    it('rolls back draft state if mutation fails', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        mockMutateAsync.mockRejectedValueOnce(new Error('Failed to save'));

        const { result } = renderHook(() => useRoleMatrix());

        // Toggle perm-2 ON
        await act(async () => {
            result.current.handlePermissionToggle(1, 'perm-2', true);
        });

        // Verify draft was reverted to the original backend state ['perm-1']
        expect(result.current.draftPermissionIdsByRoleId[1]).toEqual(['perm-1']);
        consoleError.mockRestore();
    });
});
