import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { getCourses, type PaginatedApiResponse } from '@sentinel/services';
import type { Course } from '@sentinel/shared/types';
import { COURSE_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

type UseCoursesQueryArgs = {
    search?: string;
    institutionId?: string | null;
    departmentId?: string | null;
    page?: number;
    limit?: number;
    enabled?: boolean;
};

export function useCoursesQuery(
    params?: UseCoursesQueryArgs & { page?: undefined; limit?: undefined },
): UseQueryResult<Course[], Error>;
export function useCoursesQuery(
    params: UseCoursesQueryArgs & { page: number; limit: number },
): UseQueryResult<PaginatedApiResponse<Course>, Error>;

export function useCoursesQuery(params: UseCoursesQueryArgs = {}) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();
    const hasPagination = params.page !== undefined && params.limit !== undefined;

    return useQuery({
        queryKey: [
            ...COURSE_QUERY_KEYS.all,
            params.search,
            params.institutionId,
            params.departmentId,
            params.page,
            params.limit,
        ],
        queryFn: async () => {
            const response = await getCourses(apiClient, {
                search: params.search,
                institutionId: params.institutionId ?? undefined,
                departmentId: params.departmentId ?? undefined,
                page: params.page,
                limit: params.limit,
            });
            return hasPagination ? (response as unknown as PaginatedApiResponse<Course>) : response;
        },
        enabled: isAuthenticatedQueryEnabled && (params.enabled ?? true),
    });
}
