import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteUser } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { USER_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export type UseDeleteUserMutationArgs = UseMutationOptions<void, Error, string>;

export function useDeleteUserMutation(
    args: UseDeleteUserMutationArgs = {
        onSuccess: () => toast.success('User deleted successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (id) => deleteUser(apiClient, id),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
