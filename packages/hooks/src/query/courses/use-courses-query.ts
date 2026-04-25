import { useQuery } from '@tanstack/react-query';
import { getCourses } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { COURSE_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useCoursesQuery(search?: string, institutionId?: string, enabled = true) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: [...COURSE_QUERY_KEYS.all, search, institutionId],
        queryFn: () => getCourses(apiClient, search, institutionId),
        enabled: isAuthenticatedQueryEnabled && enabled,
    });
}
