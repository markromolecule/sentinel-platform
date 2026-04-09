import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getAccessControlOverview } from '@sentinel/services';
import { ACCESS_CONTROL_QUERY_KEYS } from '@sentinel/shared/constants';
import type { AccessControlOverview } from '@sentinel/shared/types';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useAccessControlOverviewQuery(): UseQueryResult<AccessControlOverview, Error> {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: ACCESS_CONTROL_QUERY_KEYS.overview(),
        queryFn: () => getAccessControlOverview(apiClient),
        enabled: isAuthenticatedQueryEnabled,
    });
}
