import { useInfiniteQuery } from '@tanstack/react-query';
import { getExamHistory, type GetExamHistoryParams } from '@sentinel/services';
import { EXAM_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

/**
 * Custom hook to fetch infinite/paginated student exam history.
 *
 * @param params - Query parameters (status, search, limit).
 */
export function useInfiniteExamHistoryQuery(params?: Omit<GetExamHistoryParams, 'page'>) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useInfiniteQuery({
        queryKey: EXAM_QUERY_KEYS.history({ infinite: true, ...(params ?? {}) }),
        queryFn: ({ pageParam = 1 }) =>
            getExamHistory(apiClient, {
                ...params,
                page: pageParam,
            }),
        getNextPageParam: (lastPage) =>
            lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
        initialPageParam: 1,
        enabled: isAuthenticatedQueryEnabled,
    });
}
