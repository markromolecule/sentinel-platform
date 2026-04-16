import { useInfiniteQuery } from '@tanstack/react-query';
import { getQuestions, type GetQuestionsParams } from '@sentinel/services';
import { QUESTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useInfiniteQuestionsQuery(params?: Omit<GetQuestionsParams, 'page'>) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useInfiniteQuery({
        queryKey: QUESTION_QUERY_KEYS.infinite(params ?? {}),
        queryFn: ({ pageParam }) =>
            getQuestions(apiClient, {
                ...params,
                page: pageParam,
            }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
        enabled: isAuthenticatedQueryEnabled,
    });
}
