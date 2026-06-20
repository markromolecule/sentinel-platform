import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { getSubjects, type PaginatedApiResponse } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';
import type { MasterSubject } from '@sentinel/shared/types';

type UseSubjectsQueryArgs = {
    search?: string;
    institutionId?: string | null;
    page?: number;
    limit?: number;
    enabled?: boolean;
};

export function useSubjectsQuery(
    params?: UseSubjectsQueryArgs & { page?: undefined; limit?: undefined },
): UseQueryResult<MasterSubject[], Error>;
export function useSubjectsQuery(
    params: UseSubjectsQueryArgs & { page: number; limit: number },
): UseQueryResult<PaginatedApiResponse<MasterSubject>, Error>;

export function useSubjectsQuery(params: UseSubjectsQueryArgs = {}) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();
    const hasPagination = params.page !== undefined && params.limit !== undefined;

    return useQuery({
        queryKey: [
            ...SUBJECT_QUERY_KEYS.all,
            params.search ?? '',
            params.institutionId ?? '',
            params.page ?? '',
            params.limit ?? '',
        ],
        queryFn: async () => {
            const response = await getSubjects(apiClient, {
                search: params.search,
                institutionId: params.institutionId ?? undefined,
                page: params.page,
                limit: params.limit,
            });
            return hasPagination ? response : response.items;
        },
        enabled: isAuthenticatedQueryEnabled && (params.enabled ?? true),
    });
}
