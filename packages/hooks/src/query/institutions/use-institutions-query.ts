import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { getInstitutions, type PaginatedApiResponse } from '@sentinel/services';
import type { Institution } from '@sentinel/shared/types';
import { INSTITUTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

type UseInstitutionsQueryArgs = {
    search?: string;
    page?: number;
    limit?: number;
    enabled?: boolean;
};

export function useInstitutionsQuery(
    params?: UseInstitutionsQueryArgs & { page?: undefined; limit?: undefined },
): UseQueryResult<Institution[], Error>;
export function useInstitutionsQuery(
    params: UseInstitutionsQueryArgs & { page: number; limit: number },
): UseQueryResult<PaginatedApiResponse<Institution>, Error>;

/**
 * Fetches institutions with optional pagination while preserving the legacy array result.
 */
export function useInstitutionsQuery(params: UseInstitutionsQueryArgs = {}) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();
    const hasPagination = params.page !== undefined && params.limit !== undefined;

    return useQuery({
        queryKey: [
            ...INSTITUTION_QUERY_KEYS.all,
            { search: params.search, page: params.page, limit: params.limit },
        ],
        queryFn: async () => {
            const response = await getInstitutions(apiClient, {
                search: params.search,
                page: params.page,
                limit: params.limit,
            });
            return hasPagination
                ? (response as unknown as PaginatedApiResponse<Institution>)
                : response;
        },
        enabled: isAuthenticatedQueryEnabled && (params.enabled ?? true),
    });
}
