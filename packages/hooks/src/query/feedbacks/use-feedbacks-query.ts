import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { getFeedbacks, type FeedbackPage, type GetFeedbacksQuery } from '@sentinel/services';
import { FEEDBACK_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export type UseFeedbacksQueryArgs = Omit<
    UseQueryOptions<FeedbackPage, Error>,
    'queryKey' | 'queryFn'
> & {
    params?: Partial<GetFeedbacksQuery>;
};

export function useFeedbacksQuery({ params, ...options }: UseFeedbacksQueryArgs = {}) {
    const apiClient = useApi();
    const enabled = useAuthenticatedQueryEnabled();

    return useQuery<FeedbackPage, Error>({
        ...options,
        queryKey: FEEDBACK_QUERY_KEYS.list(params),
        queryFn: () => getFeedbacks(apiClient, params),
        enabled: enabled && (options.enabled ?? true),
    });
}
