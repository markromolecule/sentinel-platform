import { useQuery } from '@tanstack/react-query';
import { getUser } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { USER_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useUserQuery(id: string) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();
    return useQuery({
        queryKey: USER_QUERY_KEYS.details(id),
        queryFn: () => getUser(apiClient, id),
        enabled: isAuthenticatedQueryEnabled && !!id,
    });
}
