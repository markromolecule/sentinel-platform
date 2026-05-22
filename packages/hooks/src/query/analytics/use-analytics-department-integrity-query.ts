import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
    getAnalyticsDepartmentIntegrity,
    type GetAnalyticsParams,
    type DepartmentIntegrityMetric,
} from '@sentinel/services';
import { useApi } from '../../api-provider';
import { ANALYTICS_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export type UseAnalyticsDepartmentIntegrityQueryArgs = Omit<
    UseQueryOptions<DepartmentIntegrityMetric[], Error>,
    'queryKey' | 'queryFn'
> & {
    payload?: GetAnalyticsParams;
};

/**
 * Hook to query and cache department integrity metrics.
 *
 * @param args The query arguments containing the filters and react-query options.
 * @returns The query result containing department integrity metrics list.
 */
export function useAnalyticsDepartmentIntegrityQuery({
    payload,
    ...options
}: UseAnalyticsDepartmentIntegrityQueryArgs = {}) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery<DepartmentIntegrityMetric[], Error>({
        ...options,
        queryKey: ANALYTICS_QUERY_KEYS.departmentIntegrity(payload?.institution_id),
        queryFn: () => getAnalyticsDepartmentIntegrity(apiClient, payload),
        enabled: isAuthenticatedQueryEnabled && (options.enabled ?? true),
    });
}
