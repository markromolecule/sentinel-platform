import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { createDirectConversation } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { type ConversationDetail } from '@sentinel/shared/types';
import { MESSAGES_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export type UseCreateDirectConversationMutationArgs = UseMutationOptions<
    ConversationDetail,
    Error,
    { recipientId: string }
>;

/**
 * Mutation hook to start a new direct 1:1 conversation with a recipient user.
 * Automatically invalidates active conversations list upon success.
 *
 * @param args Optional mutation options.
 * @returns The mutation object.
 */
export function useCreateDirectConversationMutation(
    args: UseCreateDirectConversationMutationArgs = {},
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation<ConversationDetail, Error, { recipientId: string }>({
        ...args,
        mutationFn: ({ recipientId }) => createDirectConversation(apiClient, recipientId),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({
                queryKey: MESSAGES_QUERY_KEYS.conversations(),
            });
            if (args.onSuccess) {
                await (args.onSuccess as any)(data, variables, context);
                return;
            }
            toast.success('Conversation started successfully');
        },
        onError: (error, variables, context) => {
            if (args.onError) {
                (args.onError as any)(error, variables, context);
                return;
            }
            toast.error(error.message || 'Failed to start conversation');
        },
    });
}
