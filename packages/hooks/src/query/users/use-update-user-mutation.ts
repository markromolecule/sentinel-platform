import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { updateUser } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { User } from '@sentinel/services';
import { UserFormValues } from '@sentinel/shared/schema';
import { USER_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export type UseUpdateUserMutationArgs = UseMutationOptions<
    User,
    Error,
    { id: string; payload: Partial<UserFormValues> }
>;

export function useUpdateUserMutation(
    args: UseUpdateUserMutationArgs = {
        onSuccess: () => toast.success('User updated successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (params) => updateUser(apiClient, params),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
            await queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.details(variables.id) });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
