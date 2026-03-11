import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { createUser, type User } from '@/data';
import { UserFormValues } from '@sentinel/shared/schema';
import { USER_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

// Type for the arguments of the useCreateUserMutation hook
export type UseCreateUserMutationArgs = UseMutationOptions<User, Error, UserFormValues>;

// Hook to create a user
export function useCreateUserMutation(
    args: UseCreateUserMutationArgs = {
        onSuccess: () => toast.success('User created successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: createUser,
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
