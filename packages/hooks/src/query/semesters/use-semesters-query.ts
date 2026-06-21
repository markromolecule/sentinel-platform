import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { getSemesters, type PaginatedApiResponse } from '@sentinel/services';
import type { Semester } from '@sentinel/shared/types';
import { SEMESTER_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

type UseSemestersQueryArgs = {
    search?: string;
    institutionId?: string | null;
    page?: number;
    limit?: number;
    enabled?: boolean;
};

export function useSemestersQuery(
    params?: UseSemestersQueryArgs & { page?: undefined; limit?: undefined },
): UseQueryResult<Semester[], Error>;
export function useSemestersQuery(
    params: UseSemestersQueryArgs & { page: number; limit: number },
): UseQueryResult<PaginatedApiResponse<Semester>, Error>;

export function useSemestersQuery(params: UseSemestersQueryArgs = {}) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();
    const hasPagination = params.page !== undefined && params.limit !== undefined;

    return useQuery({
        queryKey: [
            ...SEMESTER_QUERY_KEYS.all,
            params.search,
            params.institutionId,
            params.page,
            params.limit,
        ],
        queryFn: async () => {
            const response = await getSemesters(apiClient, {
                search: params.search,
                institutionId: params.institutionId ?? undefined,
                page: params.page,
                limit: params.limit,
            });
            return hasPagination ? (response as unknown as PaginatedApiResponse<Semester>) : response;
        },
        enabled: isAuthenticatedQueryEnabled && (params.enabled ?? true),
    });
}
