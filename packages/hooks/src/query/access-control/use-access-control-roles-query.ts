import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getAccessControlRoles } from '@sentinel/services';
import { ACCESS_CONTROL_QUERY_KEYS } from '@sentinel/shared/constants';
import type { AccessControlRole } from '@sentinel/shared/types';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useAccessControlRolesQuery(): UseQueryResult<AccessControlRole[], Error> {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: ACCESS_CONTROL_QUERY_KEYS.roles(),
        queryFn: () => getAccessControlRoles(apiClient),
        enabled: isAuthenticatedQueryEnabled,
    });
}
