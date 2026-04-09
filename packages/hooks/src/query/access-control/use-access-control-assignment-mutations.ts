import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { createAccessControlAssignment, deleteAccessControlAssignment } from '@sentinel/services';
import { ACCESS_CONTROL_QUERY_KEYS } from '@sentinel/shared/constants';
import type { AccessControlAssignment, AccessControlAssignmentInput } from '@sentinel/shared/types';
import { toast } from 'sonner';
import { useApi } from '../../api-provider';

async function invalidateAssignmentQueries(queryClient: ReturnType<typeof useQueryClient>) {
    await Promise.all([
        queryClient.invalidateQueries({ queryKey: ACCESS_CONTROL_QUERY_KEYS.assignments() }),
        queryClient.invalidateQueries({ queryKey: ACCESS_CONTROL_QUERY_KEYS.roles() }),
        queryClient.invalidateQueries({ queryKey: ACCESS_CONTROL_QUERY_KEYS.overview() }),
    ]);
}

export function useCreateAccessControlAssignmentMutation(
    args: UseMutationOptions<AccessControlAssignment, Error, AccessControlAssignmentInput> = {
        onSuccess: () => toast.success('Assignment created successfully.'),
        onError: (error) => toast.error(error.message),
    },
) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: (payload) => createAccessControlAssignment(apiClient, payload),
        onSuccess: async (data, variables, context) => {
            await invalidateAssignmentQueries(queryClient);
            (args.onSuccess as any)?.(data, variables, context);
        },
    });
}

export function useDeleteAccessControlAssignmentMutation(
    args: UseMutationOptions<void, Error, AccessControlAssignmentInput> = {
        onSuccess: () => toast.success('Assignment deleted successfully.'),
        onError: (error) => toast.error(error.message),
    },
) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: (payload) => deleteAccessControlAssignment(apiClient, payload),
        onSuccess: async (data, variables, context) => {
            await invalidateAssignmentQueries(queryClient);
            (args.onSuccess as any)?.(data, variables, context);
        },
    });
}
