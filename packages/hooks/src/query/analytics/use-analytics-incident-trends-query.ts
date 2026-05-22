import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
    getAnalyticsIncidentTrends,
    type GetAnalyticsParams,
    type IncidentTrendMetric,
} from '@sentinel/services';
import { useApi } from '../../api-provider';
import { ANALYTICS_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export type UseAnalyticsIncidentTrendsQueryArgs = Omit<
    UseQueryOptions<IncidentTrendMetric[], Error>,
    'queryKey' | 'queryFn'
> & {
    payload?: GetAnalyticsParams;
};

/**
 * Hook to query and cache weekly incident trend metrics.
 *
 * @param args The query arguments containing the filters and react-query options.
 * @returns The query result containing weekly incident trend list.
 */
export function useAnalyticsIncidentTrendsQuery({
    payload,
    ...options
}: UseAnalyticsIncidentTrendsQueryArgs = {}) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery<IncidentTrendMetric[], Error>({
        ...options,
        queryKey: ANALYTICS_QUERY_KEYS.incidentTrends(payload?.institution_id),
        queryFn: () => getAnalyticsIncidentTrends(apiClient, payload),
        enabled: isAuthenticatedQueryEnabled && (options.enabled ?? true),
    });
}
