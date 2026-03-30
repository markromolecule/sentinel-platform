import { useQuery } from '@tanstack/react-query';
import { getEnrolledSubjects } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';

export function useEnrolledSubjectsQuery(search?: string) {
    const apiClient = useApi();
    return useQuery({
        queryKey: [...SUBJECT_QUERY_KEYS.enrolled, { search }],
        queryFn: () => getEnrolledSubjects(apiClient, search),
        refetchInterval: 5000,
    });
}
