import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getUsers, User } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { USER_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

type UseUsersQueryArgs = {
    search?: string;
    limit?: number;
    offset?: number;
    departmentId?: string;
    institutionId?: string;
    role?: string | string[];
    enabled?: boolean;
};

export function useUsersQuery(args: UseUsersQueryArgs = {}): UseQueryResult<User[], Error> {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();
    const { enabled = true, ...params } = args;

    return useQuery({
        queryKey: [...USER_QUERY_KEYS.all, params],
        queryFn: () => getUsers(apiClient, params),
        enabled: isAuthenticatedQueryEnabled && enabled,
    });
}
