import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { inviteUser, type User } from '@/data';
import { UserFormValues } from '@sentinel/shared/schema';
import { USER_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

// Type for the arguments of the useInviteUserMutation hook
export type UseInviteUserMutationArgs = UseMutationOptions<User, Error, UserFormValues>;

// Hook to invite a user
export function useInviteUserMutation(
    args: UseInviteUserMutationArgs = {
        onSuccess: () => toast.success('Invite sent successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: inviteUser,
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
