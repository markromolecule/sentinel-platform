import { describe, expect, it, vi } from 'vitest';
import { useQuestionTypeCountsQuery } from './use-question-type-counts-query';
import { getQuestionTypeCounts } from '@sentinel/services';
import { QUESTION_QUERY_KEYS } from '@sentinel/shared/constants';

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
    getQuestionTypeCounts: vi.fn(),
}));

vi.mock('../../api-provider', () => ({
    useApi: vi.fn(() => ({ mockClient: true })),
}));

vi.mock('../_shared/use-authenticated-query-enabled', () => ({
    useAuthenticatedQueryEnabled: vi.fn(() => true),
}));

describe('useQuestionTypeCountsQuery', () => {
    it('passes active filters to getQuestionTypeCounts and sets correct queryKey', () => {
        const params = {
            search: 'geometry',
            collectionId: '11111111-1111-4111-8111-111111111111',
        };
        const query = useQuestionTypeCountsQuery(params) as any;

        expect(query.queryKey).toEqual(QUESTION_QUERY_KEYS.typeCounts(params));
        expect(getQuestionTypeCounts).toHaveBeenCalledWith({ mockClient: true }, params);
        expect(query.enabled).toBe(true);
    });
});
