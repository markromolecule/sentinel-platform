import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { inviteUser, type InviteUserResult } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { UserFormValues } from '@sentinel/shared/schema';
import { USER_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export type UseInviteUserMutationArgs = UseMutationOptions<InviteUserResult, Error, UserFormValues>;

async function copyInviteLink(inviteLink: string) {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
        return false;
    }

    try {
        await navigator.clipboard.writeText(inviteLink);
        return true;
    } catch {
        return false;
    }
}

export function useInviteUserMutation(
    args: UseInviteUserMutationArgs = {
        onSuccess: async (result) => {
            if (!result.inviteLink) {
                toast.success('Invitation sent successfully');
                return;
            }

            const copied = await copyInviteLink(result.inviteLink);

            toast.success(
                copied
                    ? 'Invite link generated and copied to clipboard.'
                    : 'Invite link generated successfully.',
                {
                    description:
                        'Supabase email delivery was unavailable, so the app generated a direct invite link for this environment.',
                    ...(copied
                        ? {}
                        : {
                              action: {
                                  label: 'Copy link',
                                  onClick: () => {
                                      void copyInviteLink(result.inviteLink!);
                                  },
                              },
                          }),
                },
            );
        },
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (payload) => inviteUser(apiClient, payload),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
