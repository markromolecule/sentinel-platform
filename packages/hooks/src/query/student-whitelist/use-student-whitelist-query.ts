import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import {
    getStudentWhitelist,
    type GetStudentWhitelistParams,
    type PaginatedApiResponse,
} from '@sentinel/services';
import type { StudentWhitelist } from '@sentinel/shared/types';
import { STUDENT_WHITELIST_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useStudentWhitelistQuery(
    params?: GetStudentWhitelistParams & { page?: undefined; limit?: undefined },
): UseQueryResult<StudentWhitelist[], Error>;
export function useStudentWhitelistQuery(
    params: GetStudentWhitelistParams & { page: number; limit: number },
): UseQueryResult<PaginatedApiResponse<StudentWhitelist>, Error>;

export function useStudentWhitelistQuery(params: GetStudentWhitelistParams = {}) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();
    const hasPagination = params.page !== undefined && params.limit !== undefined;

    return useQuery({
        queryKey: [...STUDENT_WHITELIST_QUERY_KEYS.all, params],
        queryFn: async () => {
            const response = await getStudentWhitelist(apiClient, params);
            return hasPagination
                ? (response as unknown as PaginatedApiResponse<StudentWhitelist>)
                : response;
        },
        enabled: isAuthenticatedQueryEnabled,
    });
}
