import { useQuery } from '@tanstack/react-query';
import { getEnrollmentRequests } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useEnrollmentRequestsQuery(
    status?: 'PENDING' | 'APPROVED' | 'REJECTED',
    search?: string,
) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();
    return useQuery({
        queryKey: [...SUBJECT_QUERY_KEYS.all, 'requests', status || 'ALL', { search }],
        queryFn: () => getEnrollmentRequests(apiClient, status, search),
        enabled: isAuthenticatedQueryEnabled,
        refetchInterval: 5000,
    });
}
