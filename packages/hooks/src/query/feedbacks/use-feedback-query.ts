import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { getFeedback, type FeedbackRecord } from '@sentinel/services';
import { FEEDBACK_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export type UseFeedbackQueryArgs = Omit<UseQueryOptions<FeedbackRecord, Error>, 'queryKey' | 'queryFn'> & {
    feedbackId?: string;
};

export function useFeedbackQuery({ feedbackId, ...options }: UseFeedbackQueryArgs) {
    const apiClient = useApi();
    const enabled = useAuthenticatedQueryEnabled();

    return useQuery<FeedbackRecord, Error>({
        ...options,
        queryKey: feedbackId ? FEEDBACK_QUERY_KEYS.detail(feedbackId) : FEEDBACK_QUERY_KEYS.details(),
        queryFn: () => getFeedback(apiClient, feedbackId!),
        enabled: enabled && Boolean(feedbackId) && (options.enabled ?? true),
    });
}
