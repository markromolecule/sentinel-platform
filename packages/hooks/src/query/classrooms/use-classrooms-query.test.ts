import { describe, expect, it, vi } from 'vitest';
import { useClassroomsQuery } from './use-classrooms-query';
import { getClassrooms } from '@sentinel/services';
import { CLASSROOM_QUERY_KEYS } from '@sentinel/shared/constants';

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
    getClassrooms: vi.fn(),
}));

vi.mock('../../api-provider', () => ({
    useApi: vi.fn(() => ({ mockClient: true })),
}));

vi.mock('../_shared/use-authenticated-query-enabled', () => ({
    useAuthenticatedQueryEnabled: vi.fn(() => true),
}));

describe('useClassroomsQuery', () => {
    it('keeps search and department scope in the query key', () => {
        const query = useClassroomsQuery({
            search: 'physics',
            departmentId: 'department-1',
        }) as any;

        expect(query.queryKey).toEqual([
            ...CLASSROOM_QUERY_KEYS.all,
            {
                search: 'physics',
                departmentId: 'department-1',
                status: 'active',
            },
        ]);
        expect(getClassrooms).toHaveBeenCalledWith(
            { mockClient: true },
            {
                search: 'physics',
                departmentId: 'department-1',
                status: 'active',
            },
        );
        expect(query.enabled).toBe(true);
    });

    it('preserves the legacy string call signature for search-only callers', () => {
        const query = useClassroomsQuery('chemistry') as any;

        expect(query.queryKey).toEqual([
            ...CLASSROOM_QUERY_KEYS.all,
            {
                search: 'chemistry',
                departmentId: undefined,
                status: 'active',
            },
        ]);
        expect(getClassrooms).toHaveBeenCalledWith(
            { mockClient: true },
            {
                search: 'chemistry',
                departmentId: undefined,
                status: 'active',
            },
        );
    });

    it('supports custom status filter in query args', () => {
        const query = useClassroomsQuery({
            status: 'archived',
        }) as any;

        expect(query.queryKey).toEqual([
            ...CLASSROOM_QUERY_KEYS.all,
            {
                search: undefined,
                departmentId: undefined,
                status: 'archived',
            },
        ]);
        expect(getClassrooms).toHaveBeenCalledWith(
            { mockClient: true },
            {
                search: undefined,
                departmentId: undefined,
                status: 'archived',
            },
        );
    });
});
