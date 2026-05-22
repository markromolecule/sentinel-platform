import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
    getAnalyticsExamCompletions,
    type GetAnalyticsParams,
    type ExamCompletionMetric,
} from '@sentinel/services';
import { useApi } from '../../api-provider';
import { ANALYTICS_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export type UseAnalyticsExamCompletionsQueryArgs = Omit<
    UseQueryOptions<ExamCompletionMetric[], Error>,
    'queryKey' | 'queryFn'
> & {
    payload?: GetAnalyticsParams;
};

/**
 * Hook to query and cache exam completions distribution metrics.
 *
 * @param args The query arguments containing the filters and react-query options.
 * @returns The query result containing exam completions distribution list.
 */
export function useAnalyticsExamCompletionsQuery({
    payload,
    ...options
}: UseAnalyticsExamCompletionsQueryArgs = {}) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery<ExamCompletionMetric[], Error>({
        ...options,
        queryKey: ANALYTICS_QUERY_KEYS.examCompletions(payload?.institution_id),
        queryFn: () => getAnalyticsExamCompletions(apiClient, payload),
        enabled: isAuthenticatedQueryEnabled && (options.enabled ?? true),
    });
}
