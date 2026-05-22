import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
    getAnalyticsKPIs,
    type GetAnalyticsParams,
    type AnalyticsKPIsSummary,
} from '@sentinel/services';
import { useApi } from '../../api-provider';
import { ANALYTICS_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export type UseAnalyticsKPIsQueryArgs = Omit<
    UseQueryOptions<AnalyticsKPIsSummary, Error>,
    'queryKey' | 'queryFn'
> & {
    payload?: GetAnalyticsParams;
};

/**
 * Hook to query and cache high-level KPI summaries for analytics.
 *
 * @param args The query arguments containing the filters and react-query options.
 * @returns The query result containing KPIs summary.
 */
export function useAnalyticsKPIsQuery({ payload, ...options }: UseAnalyticsKPIsQueryArgs = {}) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery<AnalyticsKPIsSummary, Error>({
        ...options,
        queryKey: ANALYTICS_QUERY_KEYS.kpis(payload?.institution_id),
        queryFn: () => getAnalyticsKPIs(apiClient, payload),
        enabled: isAuthenticatedQueryEnabled && (options.enabled ?? true),
    });
}
