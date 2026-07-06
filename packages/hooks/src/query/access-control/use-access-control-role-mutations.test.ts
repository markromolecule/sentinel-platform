import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useReplaceAccessControlRolePermissionsMutation, useResetAccessControlRolePermissionsToBlueprintMutation } from './use-access-control-role-mutations';
import { replaceAccessControlRolePermissions, resetAccessControlRolePermissionsToBlueprint } from '@sentinel/services';
import { ACCESS_CONTROL_QUERY_KEYS } from '@sentinel/shared/constants';

const mockInvalidateQueries = vi.fn();

vi.mock('@tanstack/react-query', () => ({
    useQueryClient: vi.fn(() => ({
        invalidateQueries: mockInvalidateQueries,
    })),
    useMutation: vi.fn((options: any) => {
        const mutateAsync = async (variables: any) => {
            try {
                if (options.mutationFn) {
                    await options.mutationFn(variables);
                }
                if (options.onSuccess) {
                    await options.onSuccess(undefined, variables, null);
                }
            } catch (error) {
                if (options.onError) {
                    options.onError(error, variables, null);
                }
                throw error;
            }
        };
        return { mutateAsync };
    }),
}));

vi.mock('@sentinel/services', () => ({
    createAccessControlRole: vi.fn(),
    deleteAccessControlRole: vi.fn(),
    replaceAccessControlRolePermissions: vi.fn(),
    resetAccessControlRolePermissionsToBlueprint: vi.fn(),
    updateAccessControlRole: vi.fn(),
}));

vi.mock('../../api-provider', () => ({
    useApi: vi.fn(() => ({ mockClient: true })),
}));

describe('useReplaceAccessControlRolePermissionsMutation Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls replaceAccessControlRolePermissions and invalidates role, overview, and permission caches on success', async () => {
        const variables = { roleId: 1, permissionIds: ['perm-1', 'perm-2'] };

        const mutation = useReplaceAccessControlRolePermissionsMutation();
        await (mutation as any).mutateAsync(variables);

        expect(replaceAccessControlRolePermissions).toHaveBeenCalledWith(
            { mockClient: true },
            variables.roleId,
            variables.permissionIds,
        );

        expect(mockInvalidateQueries).toHaveBeenCalledTimes(3);
        expect(mockInvalidateQueries).toHaveBeenNthCalledWith(1, {
            queryKey: ACCESS_CONTROL_QUERY_KEYS.roles(),
        });
        expect(mockInvalidateQueries).toHaveBeenNthCalledWith(2, {
            queryKey: ACCESS_CONTROL_QUERY_KEYS.overview(),
        });
        expect(mockInvalidateQueries).toHaveBeenNthCalledWith(3, {
            queryKey: ACCESS_CONTROL_QUERY_KEYS.permissions(),
        });
    });
});

describe('useResetAccessControlRolePermissionsToBlueprintMutation Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls resetAccessControlRolePermissionsToBlueprint and invalidates caches on success', async () => {
        const roleId = 1;

        const mutation = useResetAccessControlRolePermissionsToBlueprintMutation();
        await (mutation as any).mutateAsync(roleId);

        expect(resetAccessControlRolePermissionsToBlueprint).toHaveBeenCalledWith(
            { mockClient: true },
            roleId,
        );

        expect(mockInvalidateQueries).toHaveBeenCalledTimes(3);
        expect(mockInvalidateQueries).toHaveBeenNthCalledWith(1, {
            queryKey: ACCESS_CONTROL_QUERY_KEYS.roles(),
        });
        expect(mockInvalidateQueries).toHaveBeenNthCalledWith(2, {
            queryKey: ACCESS_CONTROL_QUERY_KEYS.overview(),
        });
        expect(mockInvalidateQueries).toHaveBeenNthCalledWith(3, {
            queryKey: ACCESS_CONTROL_QUERY_KEYS.permissions(),
        });
    });
});
