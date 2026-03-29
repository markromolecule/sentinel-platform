import { useQuery } from '@tanstack/react-query';
import { getSubjects } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';

export function useSubjectsQuery(search?: string) {
    const apiClient = useApi();
    return useQuery({
        queryKey: [...SUBJECT_QUERY_KEYS.all, search],
        queryFn: () => getSubjects(apiClient, search),
    });
}
