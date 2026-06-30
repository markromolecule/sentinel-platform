import { describe, expect, it, vi } from 'vitest';
import { useFeedbacksQuery } from './use-feedbacks-query';

const { mockGetFeedbacks, mockFeedbackQueryKeys } = vi.hoisted(() => ({
    mockGetFeedbacks: vi.fn(),
    mockFeedbackQueryKeys: {
        all: ['feedbacks'],
        lists: () => ['feedbacks', 'list'],
        list: (params?: unknown) => ['feedbacks', 'list', params],
        details: () => ['feedbacks', 'detail'],
        detail: (feedbackId: string) => ['feedbacks', 'detail', feedbackId],
    },
}));

vi.mock('@tanstack/react-query', () => ({
    useQuery: vi.fn((options: any) => {
        if (options.queryFn) {
            options.queryFn();
        }

        return {
            queryKey: options.queryKey,
            enabled: options.enabled,
        };
    }),
}));

vi.mock('@sentinel/shared/constants', () => ({
    FEEDBACK_QUERY_KEYS: mockFeedbackQueryKeys,
}));

vi.mock('../../api-provider', () => ({
    useApi: () => ({ mockClient: true }),
}));

vi.mock('../_shared/use-authenticated-query-enabled', () => ({
    useAuthenticatedQueryEnabled: () => true,
}));

vi.mock('@sentinel/services', () => ({
    getFeedbacks: (...args: unknown[]) => mockGetFeedbacks(...args),
}));

describe('useFeedbacksQuery', () => {
    it('uses the feedback list query key', () => {
        const params = { page: 1 };
        const query = useFeedbacksQuery({ params }) as any;

        expect(query.queryKey).toEqual(mockFeedbackQueryKeys.list(params));
        expect(mockGetFeedbacks).toHaveBeenCalledWith({ mockClient: true }, params);
        expect(query.enabled).toBe(true);
    });
});
