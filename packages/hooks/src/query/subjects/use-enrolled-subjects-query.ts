import { useQuery } from '@tanstack/react-query';
import { getEnrolledSubjects } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useEnrolledSubjectsQuery(search?: string) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();
    return useQuery({
        queryKey: [...SUBJECT_QUERY_KEYS.enrolled, { search }],
        queryFn: () => getEnrolledSubjects(apiClient, search),
        enabled: isAuthenticatedQueryEnabled,
        refetchInterval: 5000,
    });
}
