import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useInfiniteExamHistoryQuery } from './use-infinite-exam-history-query';
import { getExamHistory } from '@sentinel/services';
import { EXAM_QUERY_KEYS } from '@sentinel/shared/constants';

vi.mock('@tanstack/react-query', () => ({
    useInfiniteQuery: vi.fn((options: any) => {
        if (options.queryFn) {
            options.queryFn({ pageParam: 1 });
        }
        return {
            queryKey: options.queryKey,
            enabled: options.enabled,
            getNextPageParam: options.getNextPageParam,
        };
    }),
}));

vi.mock('@sentinel/services', () => ({
    getExamHistory: vi.fn(),
    getExamHistoryDetail: vi.fn(),
}));

vi.mock('../../api-provider', () => ({
    useApi: vi.fn(() => ({ mockClient: true })),
}));

vi.mock('../_shared/use-authenticated-query-enabled', () => ({
    useAuthenticatedQueryEnabled: vi.fn(() => true),
}));

describe('useInfiniteExamHistoryQuery', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('sets the correct query key and queries backend via getExamHistory', () => {
        const queryParams = { status: 'turned_in' as const, search: 'midterm' };

        const query = useInfiniteExamHistoryQuery(queryParams) as any;

        expect(query.queryKey).toEqual(
            EXAM_QUERY_KEYS.history({ infinite: true, ...queryParams }),
        );
        expect(getExamHistory).toHaveBeenCalledWith(
            { mockClient: true },
            {
                ...queryParams,
                page: 1,
            },
        );
        expect(query.enabled).toBe(true);
    });

    it('returns correct page parameter from getNextPageParam', () => {
        const query = useInfiniteExamHistoryQuery() as any;

        const hasMore = query.getNextPageParam({
            items: [],
            pagination: { page: 1, limit: 10, total: 25, hasMore: true },
        });
        expect(hasMore).toBe(2);

        const noMore = query.getNextPageParam({
            items: [],
            pagination: { page: 3, limit: 10, total: 25, hasMore: false },
        });
        expect(noMore).toBeUndefined();
    });
});
