import { useQuery } from '@tanstack/react-query';
import { getUser } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { USER_QUERY_KEYS } from '@sentinel/shared/constants';

export function useUserQuery(id: string) {
    const apiClient = useApi();
    return useQuery({
        queryKey: USER_QUERY_KEYS.details(id),
        queryFn: () => getUser(apiClient, id),
        enabled: !!id,
    });
}
