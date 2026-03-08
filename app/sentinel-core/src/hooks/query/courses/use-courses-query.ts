import { useQuery } from '@tanstack/react-query';
import { getCourses } from '@/data';
import { COURSE_QUERY_KEYS } from '@sentinel/shared/constants';

// Hook to fetch all courses
export function useCoursesQuery() {
    return useQuery({
        queryKey: COURSE_QUERY_KEYS.all,
        queryFn: () => getCourses(),
    });
}
