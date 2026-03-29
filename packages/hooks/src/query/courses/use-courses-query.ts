import { useQuery } from '@tanstack/react-query';
import { getCourses } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { COURSE_QUERY_KEYS } from '@sentinel/shared/constants';

export function useCoursesQuery(search?: string) {
    const apiClient = useApi();
    return useQuery({
        queryKey: [...COURSE_QUERY_KEYS.all, search],
        queryFn: () => getCourses(apiClient, search),
    });
}
