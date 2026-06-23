import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useEnrollmentRequestsQuery } from './use-enrollment-requests-query';
import { getEnrollmentRequests } from '@sentinel/services';
import { SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';

vi.mock('@tanstack/react-query', () => ({
    useQuery: vi.fn((options: any) => options),
}));

vi.mock('@sentinel/services', () => ({
    getEnrollmentRequests: vi.fn(),
}));

vi.mock('../../api-provider', () => ({
    useApi: vi.fn(() => ({ mockClient: true })),
}));

vi.mock('../_shared/use-authenticated-query-enabled', () => ({
    useAuthenticatedQueryEnabled: vi.fn(() => true),
}));

describe('useEnrollmentRequestsQuery', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns the array response for non-paginated calls', async () => {
        vi.mocked(getEnrollmentRequests).mockResolvedValue([
            { request_id: 'request-1' },
        ] as any);

        const query = useEnrollmentRequestsQuery('PENDING', 'physics', 'institution-1') as any;
        const data = await query.queryFn();

        expect(query.queryKey).toEqual([
            ...SUBJECT_QUERY_KEYS.all,
            'requests',
            'PENDING',
            'physics',
            'institution-1',
            '',
            '',
        ]);
        expect(data).toEqual([{ request_id: 'request-1' }]);
    });

    it('returns the paginated response unchanged when page and limit are provided', async () => {
        vi.mocked(getEnrollmentRequests).mockResolvedValue({
            items: [{ request_id: 'request-2' }],
            pagination: {
                page: 1,
                limit: 10,
                total: 1,
                hasMore: false,
            },
        } as any);

        const query = useEnrollmentRequestsQuery({
            status: 'APPROVED',
            search: 'chemistry',
            institutionId: 'institution-2',
            page: 1,
            limit: 10,
        }) as any;
        const data = await query.queryFn();

        expect(data).toEqual({
            items: [{ request_id: 'request-2' }],
            pagination: {
                page: 1,
                limit: 10,
                total: 1,
                hasMore: false,
            },
        });
    });
});
