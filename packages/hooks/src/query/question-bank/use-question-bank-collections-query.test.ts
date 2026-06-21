import { describe, expect, it, vi } from 'vitest';
import { useQuestionBankCollectionsQuery } from './use-question-bank-collections-query';
import { getQuestionBankCollections } from '@sentinel/services';
import { QUESTION_BANK_COLLECTION_QUERY_KEYS } from '@sentinel/shared/constants';

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
    getQuestionBankCollections: vi.fn(),
}));

vi.mock('../../api-provider', () => ({
    useApi: vi.fn(() => ({ mockClient: true })),
}));

vi.mock('../_shared/use-authenticated-query-enabled', () => ({
    useAuthenticatedQueryEnabled: vi.fn(() => true),
}));

describe('useQuestionBankCollectionsQuery', () => {
    it('passes search, institutionId, page, and pageSize to services and queryKey', () => {
        const query = useQuestionBankCollectionsQuery({
            search: 'math',
            institutionId: 'inst-1',
            page: 1,
            pageSize: 10,
        }) as any;

        expect(query.queryKey).toEqual([
            ...QUESTION_BANK_COLLECTION_QUERY_KEYS.all,
            {
                search: 'math',
                institutionId: 'inst-1',
                page: 1,
                pageSize: 10,
            },
        ]);
        expect(getQuestionBankCollections).toHaveBeenCalledWith(
            { mockClient: true },
            {
                search: 'math',
                institutionId: 'inst-1',
                page: 1,
                pageSize: 10,
            },
        );
        expect(query.enabled).toBe(true);
    });
});
