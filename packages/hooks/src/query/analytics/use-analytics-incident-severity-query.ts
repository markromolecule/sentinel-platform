import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
    getAnalyticsIncidentSeverity,
    type GetAnalyticsParams,
    type IncidentSeverityDistribution,
} from '@sentinel/services';
import { useApi } from '../../api-provider';
import { ANALYTICS_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export type UseAnalyticsIncidentSeverityQueryArgs = Omit<
    UseQueryOptions<IncidentSeverityDistribution[], Error>,
    'queryKey' | 'queryFn'
> & {
    payload?: GetAnalyticsParams;
};

/**
 * Hook to query and cache incident severity distribution metrics.
 *
 * @param args The query arguments containing the filters and react-query options.
 * @returns The query result containing incident severity distribution list.
 */
export function useAnalyticsIncidentSeverityQuery({
    payload,
    ...options
}: UseAnalyticsIncidentSeverityQueryArgs = {}) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery<IncidentSeverityDistribution[], Error>({
        ...options,
        queryKey: ANALYTICS_QUERY_KEYS.incidentSeverity(payload?.institution_id),
        queryFn: () => getAnalyticsIncidentSeverity(apiClient, payload),
        enabled: isAuthenticatedQueryEnabled && (options.enabled ?? true),
    });
}
