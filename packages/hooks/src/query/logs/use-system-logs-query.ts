import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { getSystemLogs, type LogQueryParams, type LogPage } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { LOGS_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export type UseSystemLogsQueryArgs = Omit<
    UseQueryOptions<LogPage, Error>,
    'queryKey' | 'queryFn'
> & {
    params?: LogQueryParams;
};

/**
 * Hook to query and cache system exception and background process audit logs.
 *
 * @param args Query options and parameter filters.
 * @returns React Query result containing system logs.
 */
export function useSystemLogsQuery({ params, ...options }: UseSystemLogsQueryArgs = {}) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery<LogPage, Error>({
        ...options,
        queryKey: LOGS_QUERY_KEYS.system(params),
        queryFn: () => getSystemLogs(apiClient, params),
        enabled: isAuthenticatedQueryEnabled && (options.enabled ?? true),
    });
}
