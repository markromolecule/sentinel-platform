import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { updateUser, type User } from '@/data';
import { UserFormValues } from '@sentinel/shared/schema';
import { USER_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

// Hook to update a user
export function useUpdateUserMutation(
    args: UseUpdateUserMutationArgs = {
        onSuccess: () => toast.success('User updated successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: updateUser,
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}

// Type for the input of the updateUser function
export type UpdateUserInput = { id: string; payload: Partial<UserFormValues> };

// Type for the arguments of the useUpdateUserMutation hook
export type UseUpdateUserMutationArgs = UseMutationOptions<User, Error, UpdateUserInput>;
