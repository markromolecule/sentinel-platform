import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import {
    createAccessControlPermission,
    deleteAccessControlPermission,
    updateAccessControlPermission,
} from '@sentinel/services';
import { ACCESS_CONTROL_QUERY_KEYS } from '@sentinel/shared/constants';
import type { AccessControlPermission, AccessControlPermissionInput } from '@sentinel/shared/types';
import { toast } from 'sonner';
import { useApi } from '../../api-provider';

type PermissionMutationOptions<TData, TVariables> = UseMutationOptions<TData, Error, TVariables>;

async function invalidatePermissionQueries(queryClient: ReturnType<typeof useQueryClient>) {
    await Promise.all([
        queryClient.invalidateQueries({ queryKey: ACCESS_CONTROL_QUERY_KEYS.permissions() }),
        queryClient.invalidateQueries({ queryKey: ACCESS_CONTROL_QUERY_KEYS.roles() }),
        queryClient.invalidateQueries({ queryKey: ACCESS_CONTROL_QUERY_KEYS.overview() }),
    ]);
}

export function useCreateAccessControlPermissionMutation(
    args: PermissionMutationOptions<AccessControlPermission, AccessControlPermissionInput> = {
        onSuccess: () => toast.success('Permission created successfully.'),
        onError: (error) => toast.error(error.message),
    },
) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: (payload) => createAccessControlPermission(apiClient, payload),
        onSuccess: async (data, variables, context) => {
            await invalidatePermissionQueries(queryClient);
            (args.onSuccess as any)?.(data, variables, context);
        },
    });
}

export function useUpdateAccessControlPermissionMutation(
    args: PermissionMutationOptions<
        AccessControlPermission,
        { permissionId: string; payload: Partial<AccessControlPermissionInput> }
    > = {
        onSuccess: () => toast.success('Permission updated successfully.'),
        onError: (error) => toast.error(error.message),
    },
) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: ({ permissionId, payload }) =>
            updateAccessControlPermission(apiClient, permissionId, payload),
        onSuccess: async (data, variables, context) => {
            await invalidatePermissionQueries(queryClient);
            (args.onSuccess as any)?.(data, variables, context);
        },
    });
}

export function useDeleteAccessControlPermissionMutation(
    args: PermissionMutationOptions<void, string> = {
        onSuccess: () => toast.success('Permission deleted successfully.'),
        onError: (error) => toast.error(error.message),
    },
) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: (permissionId) => deleteAccessControlPermission(apiClient, permissionId),
        onSuccess: async (data, variables, context) => {
            await invalidatePermissionQueries(queryClient);
            (args.onSuccess as any)?.(data, variables, context);
        },
    });
}
