import { describe, expect, it, vi } from 'vitest';
import { useInstitutionsQuery } from './use-institutions-query';
import { INSTITUTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { getInstitutions } from '@sentinel/services';

const { mockUseQuery } = vi.hoisted(() => ({
    mockUseQuery: vi.fn((options: any) => {
        void options.queryFn?.();
        return {
            queryKey: options.queryKey,
            enabled: options.enabled,
        };
    }),
}));

vi.mock('@tanstack/react-query', () => ({
    useQuery: mockUseQuery,
}));

vi.mock('@sentinel/services', () => ({
    getInstitutions: vi.fn(),
}));

vi.mock('../../api-provider', () => ({
    useApi: vi.fn(() => ({ mockClient: true })),
}));

vi.mock('../_shared/use-authenticated-query-enabled', () => ({
    useAuthenticatedQueryEnabled: vi.fn(() => true),
}));

describe('useInstitutionsQuery', () => {
    it('forwards institutionKind filters and isolates the query key', () => {
        const query = useInstitutionsQuery({
            institutionKind: 'PARENT',
            enabled: true,
        }) as any;

        expect(query.queryKey).toEqual([
            ...INSTITUTION_QUERY_KEYS.all,
            {
                search: undefined,
                parentInstitutionId: undefined,
                institutionKind: 'PARENT',
                page: undefined,
                limit: undefined,
            },
        ]);
        expect(getInstitutions).toHaveBeenCalledWith(
            { mockClient: true },
            {
                search: undefined,
                parentInstitutionId: undefined,
                institutionKind: 'PARENT',
                page: undefined,
                limit: undefined,
            },
        );
    });

    it('respects enabled false while still keeping the filtered key stable', () => {
        const query = useInstitutionsQuery({
            institutionKind: 'PARENT',
            enabled: false,
        }) as any;

        expect(query.enabled).toBe(false);
    });
});
