import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { getAuthLogs, type LogQueryParams, type LogPage } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { LOGS_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export type UseAuthLogsQueryArgs = Omit<UseQueryOptions<LogPage, Error>, 'queryKey' | 'queryFn'> & {
    params?: LogQueryParams;
};

/**
 * Hook to query and cache authenticated session/authentication audit logs.
 *
 * @param args Query options and parameter filters.
 * @returns React Query result containing authentication logs.
 */
export function useAuthLogsQuery({ params, ...options }: UseAuthLogsQueryArgs = {}) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery<LogPage, Error>({
        ...options,
        queryKey: LOGS_QUERY_KEYS.auth(params),
        queryFn: () => getAuthLogs(apiClient, params),
        enabled: isAuthenticatedQueryEnabled && (options.enabled ?? true),
    });
}
