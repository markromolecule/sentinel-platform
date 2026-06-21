import { describe, expect, it, vi } from 'vitest';
import { useQuestionCollectionsQuery } from './use-question-collections-query';
import { getQuestionCollections } from '@sentinel/services';
import { QUESTION_COLLECTION_QUERY_KEYS } from '@sentinel/shared/constants';

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

vi.mock('@sentinel/services', () => ({
    getQuestionCollections: vi.fn(),
}));

vi.mock('../../api-provider', () => ({
    useApi: vi.fn(() => ({ mockClient: true })),
}));

vi.mock('../_shared/use-authenticated-query-enabled', () => ({
    useAuthenticatedQueryEnabled: vi.fn(() => true),
}));

describe('useQuestionCollectionsQuery', () => {
    it('passes search, institutionId, page, and pageSize to services and queryKey', () => {
        const query = useQuestionCollectionsQuery({
            search: 'science',
            institutionId: 'inst-2',
            page: 2,
            pageSize: 20,
        }) as any;

        expect(query.queryKey).toEqual([
            ...QUESTION_COLLECTION_QUERY_KEYS.all,
            {
                search: 'science',
                institutionId: 'inst-2',
                page: 2,
                pageSize: 20,
            },
        ]);
        expect(getQuestionCollections).toHaveBeenCalledWith(
            { mockClient: true },
            {
                search: 'science',
                institutionId: 'inst-2',
                page: 2,
                pageSize: 20,
            },
        );
        expect(query.enabled).toBe(true);
    });
});
