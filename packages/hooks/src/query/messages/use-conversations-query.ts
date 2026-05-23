import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { getConversations } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { type ConversationSummary } from '@sentinel/shared/types';
import { MESSAGES_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export type UseConversationsQueryArgs = Omit<
    UseQueryOptions<ConversationSummary[], Error>,
    'queryKey' | 'queryFn'
>;

/**
 * Hook to query and cache the list of conversations for the authenticated user.
 *
 * @param options Optional query options.
 * @returns The query result containing the conversations list.
 */
export function useConversationsQuery(options: UseConversationsQueryArgs = {}) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery<ConversationSummary[], Error>({
        ...options,
        queryKey: MESSAGES_QUERY_KEYS.conversations(),
        queryFn: () => getConversations(apiClient),
        enabled: isAuthenticatedQueryEnabled && (options.enabled ?? true),
    });
}
