import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteUser } from '@/data';
import { USER_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

// Type for the arguments of the useDeleteUserMutation hook
export type UseDeleteUserMutationArgs = UseMutationOptions<void, Error, string>;

// Hook to delete a user
export function useDeleteUserMutation(
    args: UseDeleteUserMutationArgs = {
        onSuccess: () => toast.success('User deleted successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: deleteUser,
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
