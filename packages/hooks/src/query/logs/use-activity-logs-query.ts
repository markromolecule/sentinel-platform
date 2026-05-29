import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { getActivityLogs, type LogQueryParams, type LogPage } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { LOGS_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export type UseActivityLogsQueryArgs = Omit<
    UseQueryOptions<LogPage, Error>,
    'queryKey' | 'queryFn'
> & {
    params?: LogQueryParams;
};

/**
 * Hook to query and cache user operational activity logs.
 *
 * @param args Query options and parameter filters.
 * @returns React Query result containing activity logs.
 */
export function useActivityLogsQuery({ params, ...options }: UseActivityLogsQueryArgs = {}) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery<LogPage, Error>({
        ...options,
        queryKey: LOGS_QUERY_KEYS.activity(params),
        queryFn: () => getActivityLogs(apiClient, params),
        enabled: isAuthenticatedQueryEnabled && (options.enabled ?? true),
    });
}
