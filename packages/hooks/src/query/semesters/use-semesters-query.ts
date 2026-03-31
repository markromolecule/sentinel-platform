import { useQuery } from '@tanstack/react-query';
import { getSemesters } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { SEMESTER_QUERY_KEYS } from '@sentinel/shared/constants';

export function useSemestersQuery(search?: string, institutionId?: string) {
    const apiClient = useApi();
    return useQuery({
        queryKey: [...SEMESTER_QUERY_KEYS.all, search, institutionId],
        queryFn: () => getSemesters(apiClient, search, institutionId),
    });
}
