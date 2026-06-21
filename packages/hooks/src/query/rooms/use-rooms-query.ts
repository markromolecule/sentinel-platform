import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { getRooms, type PaginatedApiResponse } from '@sentinel/services';
import type { Room } from '@sentinel/shared/types';
import { ROOM_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

type UseRoomsQueryArgs = {
    search?: string;
    institutionId?: string;
    page?: number;
    limit?: number;
    enabled?: boolean;
};

export function useRoomsQuery(
    search?: string,
    institutionId?: string,
): UseQueryResult<Room[], Error>;
export function useRoomsQuery(
    params?: UseRoomsQueryArgs & { page?: undefined; limit?: undefined },
): UseQueryResult<Room[], Error>;
export function useRoomsQuery(
    params: UseRoomsQueryArgs & { page: number; limit: number },
): UseQueryResult<PaginatedApiResponse<Room>, Error>;

export function useRoomsQuery(
    searchOrParams?: string | UseRoomsQueryArgs,
    institutionId?: string,
) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    const params: UseRoomsQueryArgs =
        typeof searchOrParams === 'string'
            ? { search: searchOrParams, institutionId }
            : searchOrParams ?? {};

    const hasPagination = params.page !== undefined && params.limit !== undefined;

    return useQuery({
        queryKey: [
            ...ROOM_QUERY_KEYS.all,
            params.search,
            params.institutionId,
            params.page,
            params.limit,
        ],
        queryFn: async () => {
            const response = await getRooms(apiClient, {
                search: params.search,
                institutionId: params.institutionId,
                page: params.page,
                limit: params.limit,
            }) as any;
            return hasPagination ? (response as PaginatedApiResponse<Room>) : response;
        },
        enabled: isAuthenticatedQueryEnabled && (params.enabled ?? true),
    });
}
