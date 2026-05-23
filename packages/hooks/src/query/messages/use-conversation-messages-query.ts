import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { getConversationMessages } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { type ConversationMessage } from '@sentinel/shared/types';
import { MESSAGES_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export type UseConversationMessagesQueryArgs = Omit<
    UseQueryOptions<ConversationMessage[], Error>,
    'queryKey' | 'queryFn'
> & {
    conversationId: string;
};

/**
 * Hook to query and cache messages inside a specific conversation.
 *
 * @param args The query arguments containing the conversationId and react-query options.
 * @returns The query result containing the conversation's messages list.
 */
export function useConversationMessagesQuery({
    conversationId,
    ...options
}: UseConversationMessagesQueryArgs) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery<ConversationMessage[], Error>({
        ...options,
        queryKey: MESSAGES_QUERY_KEYS.messages(conversationId),
        queryFn: () => getConversationMessages(apiClient, conversationId),
        enabled: isAuthenticatedQueryEnabled && !!conversationId && (options.enabled ?? true),
    });
}
