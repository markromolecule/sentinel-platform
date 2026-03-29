import { useQuery } from '@tanstack/react-query';
import { getUsers } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { USER_QUERY_KEYS } from '@sentinel/shared/constants';

export function useUsersQuery(search?: string) {
    const apiClient = useApi();
    return useQuery({
        queryKey: [...USER_QUERY_KEYS.all, search],
        queryFn: () => getUsers(apiClient, search),
    });
}
