import { useQuery } from '@tanstack/react-query';
import { getCourses } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { COURSE_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useCoursesQuery(
    params: {
        search?: string;
        institutionId?: string | null;
        departmentId?: string | null;
        enabled?: boolean;
    } = {},
) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: [
            ...COURSE_QUERY_KEYS.all,
            params.search,
            params.institutionId,
            params.departmentId,
        ],
        queryFn: () =>
            getCourses(apiClient, {
                search: params.search,
                institutionId: params.institutionId ?? undefined,
                departmentId: params.departmentId ?? undefined,
            }),
        enabled: isAuthenticatedQueryEnabled && (params.enabled ?? true),
    });
}
