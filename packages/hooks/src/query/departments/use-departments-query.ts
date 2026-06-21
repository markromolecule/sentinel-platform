import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { getDepartments, type PaginatedApiResponse } from '@sentinel/services';
import type { Department } from '@sentinel/shared/types';
import { DEPARTMENT_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

type UseDepartmentsQueryArgs = {
    search?: string;
    institutionId?: string | null;
    page?: number;
    limit?: number;
    enabled?: boolean;
};

export function useDepartmentsQuery(
    params?: UseDepartmentsQueryArgs & { page?: undefined; limit?: undefined },
): UseQueryResult<Department[], Error>;
export function useDepartmentsQuery(
    params: UseDepartmentsQueryArgs & { page: number; limit: number },
): UseQueryResult<PaginatedApiResponse<Department>, Error>;

export function useDepartmentsQuery(params: UseDepartmentsQueryArgs = {}) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();
    const hasPagination = params.page !== undefined && params.limit !== undefined;

    return useQuery({
        queryKey: [
            ...DEPARTMENT_QUERY_KEYS.all,
            params.search,
            params.institutionId,
            params.page,
            params.limit,
        ],
        queryFn: async () => {
            const response = await getDepartments(apiClient, {
                search: params.search,
                institutionId: params.institutionId ?? undefined,
                page: params.page,
                limit: params.limit,
            });
            return hasPagination
                ? (response as unknown as PaginatedApiResponse<Department>)
                : response;
        },
        enabled: isAuthenticatedQueryEnabled && (params.enabled ?? true),
    });
}
