import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEnrolledSubjectsQuery } from './use-enrolled-subjects-query';
import { getEnrolledSubjects } from '@sentinel/services';
import { SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';

vi.mock('@tanstack/react-query', () => ({
    useQuery: vi.fn((options: any) => options),
}));

vi.mock('@sentinel/services', () => ({
    getEnrolledSubjects: vi.fn(),
}));

vi.mock('../../api-provider', () => ({
    useApi: vi.fn(() => ({ mockClient: true })),
}));

vi.mock('../_shared/use-authenticated-query-enabled', () => ({
    useAuthenticatedQueryEnabled: vi.fn(() => true),
}));

describe('useEnrolledSubjectsQuery', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns the array response for non-paginated calls', async () => {
        vi.mocked(getEnrolledSubjects).mockResolvedValue([
            { subject_offering_id: 'offering-1' },
        ] as any);

        const query = useEnrolledSubjectsQuery('physics') as any;
        const data = await query.queryFn();

        expect(query.queryKey).toEqual([
            ...SUBJECT_QUERY_KEYS.enrolled,
            'physics',
            '',
            '',
        ]);
        expect(data).toEqual([{ subject_offering_id: 'offering-1' }]);
    });

    it('returns the paginated response unchanged when page and limit are provided', async () => {
        vi.mocked(getEnrolledSubjects).mockResolvedValue({
            items: [{ subject_offering_id: 'offering-2' }],
            pagination: {
                page: 1,
                limit: 10,
                total: 1,
                hasMore: false,
            },
        } as any);

        const query = useEnrolledSubjectsQuery({
            search: 'chemistry',
            page: 1,
            limit: 10,
        }) as any;
        const data = await query.queryFn();

        expect(data).toEqual({
            items: [{ subject_offering_id: 'offering-2' }],
            pagination: {
                page: 1,
                limit: 10,
                total: 1,
                hasMore: false,
            },
        });
    });
});
