import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { createUser } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { User } from '@sentinel/services';
import { UserFormValues } from '@sentinel/shared/schema';
import { USER_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export type UseCreateUserMutationArgs = UseMutationOptions<
    User,
    Error,
    UserFormValues
>;

export function useCreateUserMutation(
    args: UseCreateUserMutationArgs = {
        onSuccess: () => toast.success('User created successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (payload) => createUser(apiClient, payload),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
