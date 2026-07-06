import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import {
    createAccessControlRole,
    deleteAccessControlRole,
    replaceAccessControlRolePermissions,
    resetAccessControlRolePermissionsToBlueprint,
    updateAccessControlRole,
} from '@sentinel/services';
import { ACCESS_CONTROL_QUERY_KEYS } from '@sentinel/shared/constants';
import type { AccessControlRole, AccessControlRoleInput } from '@sentinel/shared/types';
import { toast } from 'sonner';
import { useApi } from '../../api-provider';

type RoleMutationOptions<TData, TVariables> = UseMutationOptions<TData, Error, TVariables>;

async function invalidateRoleQueries(queryClient: ReturnType<typeof useQueryClient>) {
    await Promise.all([
        queryClient.invalidateQueries({ queryKey: ACCESS_CONTROL_QUERY_KEYS.roles() }),
        queryClient.invalidateQueries({ queryKey: ACCESS_CONTROL_QUERY_KEYS.overview() }),
        queryClient.invalidateQueries({ queryKey: ACCESS_CONTROL_QUERY_KEYS.permissions() }),
    ]);
}

export function useCreateAccessControlRoleMutation(
    args: RoleMutationOptions<AccessControlRole, AccessControlRoleInput> = {
        onSuccess: () => toast.success('Role created successfully.'),
        onError: (error) => toast.error(error.message),
    },
) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: (payload) => createAccessControlRole(apiClient, payload),
        onSuccess: async (data, variables, context) => {
            await invalidateRoleQueries(queryClient);
            (args.onSuccess as any)?.(data, variables, context);
        },
    });
}

export function useUpdateAccessControlRoleMutation(
    args: RoleMutationOptions<
        AccessControlRole,
        { roleId: number; payload: Partial<AccessControlRoleInput> }
    > = {
        onSuccess: () => toast.success('Role updated successfully.'),
        onError: (error) => toast.error(error.message),
    },
) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: ({ roleId, payload }) => updateAccessControlRole(apiClient, roleId, payload),
        onSuccess: async (data, variables, context) => {
            await invalidateRoleQueries(queryClient);
            (args.onSuccess as any)?.(data, variables, context);
        },
    });
}

export function useDeleteAccessControlRoleMutation(
    args: RoleMutationOptions<void, number> = {
        onSuccess: () => toast.success('Role deleted successfully.'),
        onError: (error) => toast.error(error.message),
    },
) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: (roleId) => deleteAccessControlRole(apiClient, roleId),
        onSuccess: async (data, variables, context) => {
            await invalidateRoleQueries(queryClient);
            (args.onSuccess as any)?.(data, variables, context);
        },
    });
}

export function useReplaceAccessControlRolePermissionsMutation(
    args: RoleMutationOptions<AccessControlRole, { roleId: number; permissionIds: string[] }> = {
        onSuccess: () => toast.success('Role permissions updated successfully.'),
        onError: (error) => toast.error(error.message),
    },
) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: ({ roleId, permissionIds }) =>
            replaceAccessControlRolePermissions(apiClient, roleId, permissionIds),
        onSuccess: async (data, variables, context) => {
            await invalidateRoleQueries(queryClient);
            (args.onSuccess as any)?.(data, variables, context);
        },
    });
}

export function useResetAccessControlRolePermissionsToBlueprintMutation(
    args: RoleMutationOptions<AccessControlRole, number> = {
        onSuccess: () => toast.success('Role permissions reset to blueprint successfully.'),
        onError: (error) => toast.error(error.message),
    },
) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: (roleId) => resetAccessControlRolePermissionsToBlueprint(apiClient, roleId),
        onSuccess: async (data, variables, context) => {
            await invalidateRoleQueries(queryClient);
            (args.onSuccess as any)?.(data, variables, context);
        },
    });
}
