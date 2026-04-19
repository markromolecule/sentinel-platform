import { useQuery } from '@tanstack/react-query';
import { getClassrooms } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { CLASSROOM_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useClassroomsQuery(search?: string) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: [...CLASSROOM_QUERY_KEYS.all, { search }],
        queryFn: () => getClassrooms(apiClient, search),
        enabled: isAuthenticatedQueryEnabled,
    });
}
