import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
    getAnalyticsReports,
    type GetAnalyticsReportsParams,
    type PaginatedAnalyticsReports,
} from '@sentinel/services';
import { useApi } from '../../api-provider';
import { ANALYTICS_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export type UseAnalyticsReportsQueryArgs = Omit<
    UseQueryOptions<PaginatedAnalyticsReports, Error>,
    'queryKey' | 'queryFn'
> & {
    payload?: GetAnalyticsReportsParams;
};

/**
 * Hook to query and cache paginated analytics reports.
 *
 * @param args The query arguments containing the filters, pagination, and react-query options.
 * @returns The query result containing the paginated reports.
 */
export function useAnalyticsReportsQuery({
    payload,
    ...options
}: UseAnalyticsReportsQueryArgs = {}) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery<PaginatedAnalyticsReports, Error>({
        ...options,
        queryKey: ANALYTICS_QUERY_KEYS.reports(payload?.institution_id),
        queryFn: () => getAnalyticsReports(apiClient, payload),
        enabled: isAuthenticatedQueryEnabled && (options.enabled ?? true),
    });
}
