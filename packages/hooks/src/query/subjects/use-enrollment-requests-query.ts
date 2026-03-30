import { useQuery } from '@tanstack/react-query';
import { getEnrollmentRequests } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';

export function useEnrollmentRequestsQuery(status?: 'PENDING' | 'APPROVED' | 'REJECTED') {
    const apiClient = useApi();
    return useQuery({
        queryKey: [...SUBJECT_QUERY_KEYS.all, 'requests', status || 'ALL'],
        queryFn: () => getEnrollmentRequests(apiClient, status),
        refetchInterval: 5000,
    });
}
