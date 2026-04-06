import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getUsers, User } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { USER_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useUsersQuery(params?: {
    search?: string;
    departmentId?: string;
    institutionId?: string;
    role?: string;
}): UseQueryResult<User[], Error> {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();
    return useQuery({
        queryKey: [...USER_QUERY_KEYS.all, params],
        queryFn: () => getUsers(apiClient, params),
        enabled: isAuthenticatedQueryEnabled,
    });
}
