import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
    getAnalyticsIncidentType,
    type GetAnalyticsParams,
    type IncidentTypeDistribution,
} from '@sentinel/services';
import { useApi } from '../../api-provider';
import { ANALYTICS_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export type UseAnalyticsIncidentTypeQueryArgs = Omit<
    UseQueryOptions<IncidentTypeDistribution[], Error>,
    'queryKey' | 'queryFn'
> & {
    payload?: GetAnalyticsParams;
};

/**
 * Hook to query and cache incident type distribution metrics.
 *
 * @param args The query arguments containing the filters and react-query options.
 * @returns The query result containing incident type distribution list.
 */
export function useAnalyticsIncidentTypeQuery({
    payload,
    ...options
}: UseAnalyticsIncidentTypeQueryArgs = {}) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery<IncidentTypeDistribution[], Error>({
        ...options,
        queryKey: ANALYTICS_QUERY_KEYS.incidentType(payload?.institution_id),
        queryFn: () => getAnalyticsIncidentType(apiClient, payload),
        enabled: isAuthenticatedQueryEnabled && (options.enabled ?? true),
    });
}
