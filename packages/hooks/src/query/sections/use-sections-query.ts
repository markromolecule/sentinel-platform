import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { getSections, type PaginatedApiResponse } from '@sentinel/services';
import type { Section } from '@sentinel/shared/types';
import { SECTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

type UseSectionsQueryArgs = {
    search?: string;
    institutionId?: string | null;
    courseId?: string | null;
    page?: number;
    limit?: number;
    enabled?: boolean;
};

export function useSectionsQuery(
    params?: UseSectionsQueryArgs & { page?: undefined; limit?: undefined },
): UseQueryResult<Section[], Error>;
export function useSectionsQuery(
    params: UseSectionsQueryArgs & { page: number; limit: number },
): UseQueryResult<PaginatedApiResponse<Section>, Error>;

export function useSectionsQuery(params: UseSectionsQueryArgs = {}) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();
    const hasPagination = params.page !== undefined && params.limit !== undefined;

    return useQuery({
        queryKey: [
            ...SECTION_QUERY_KEYS.all,
            params.search,
            params.institutionId,
            params.courseId,
            params.page,
            params.limit,
        ],
        queryFn: async () => {
            const response = await getSections(apiClient, {
                search: params.search,
                institutionId: params.institutionId ?? undefined,
                courseId: params.courseId ?? undefined,
                page: params.page,
                limit: params.limit,
            });
            return hasPagination ? (response as unknown as PaginatedApiResponse<Section>) : response;
        },
        enabled: isAuthenticatedQueryEnabled && (params.enabled ?? true),
    });
}
