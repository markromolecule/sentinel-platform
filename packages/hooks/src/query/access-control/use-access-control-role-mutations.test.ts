import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useReplaceAccessControlRolePermissionsMutation } from './use-access-control-role-mutations';
import { replaceAccessControlRolePermissions } from '@sentinel/services';
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
    updateAccessControlRole: vi.fn(),
}));

vi.mock('../../api-provider', () => ({
    useApi: vi.fn(() => ({ mockClient: true })),
}));

describe('useReplaceAccessControlRolePermissionsMutation Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls replaceAccessControlRolePermissions and invalidates only roles cache on success', async () => {
        const variables = { roleId: 1, permissionIds: ['perm-1', 'perm-2'] };

        const mutation = useReplaceAccessControlRolePermissionsMutation();
        await (mutation as any).mutateAsync(variables);

        expect(replaceAccessControlRolePermissions).toHaveBeenCalledWith(
            { mockClient: true },
            variables.roleId,
            variables.permissionIds,
        );

        // Verify that only ACCESS_CONTROL_QUERY_KEYS.roles() is invalidated
        expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: ACCESS_CONTROL_QUERY_KEYS.roles(),
        });
    });
});
