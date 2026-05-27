import { describe, expect, it, vi } from 'vitest';
import { useAuthLogsQuery } from './use-auth-logs-query';
import { getAuthLogs } from '@sentinel/services';
import { LOGS_QUERY_KEYS } from '@sentinel/shared/constants';

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
    getAuthLogs: vi.fn(),
}));

vi.mock('../../api-provider', () => ({
    useApi: vi.fn(() => ({ mockClient: true })),
}));

vi.mock('../_shared/use-authenticated-query-enabled', () => ({
    useAuthenticatedQueryEnabled: vi.fn(() => true),
}));

describe('useAuthLogsQuery Hook', () => {
    it('sets correct query key and calls the client function', () => {
        const params = { page: 2, pageSize: 15 };
        const query = useAuthLogsQuery({ params }) as any;

        expect(query.queryKey).toEqual(LOGS_QUERY_KEYS.auth(params));
        expect(getAuthLogs).toHaveBeenCalledWith({ mockClient: true }, params);
        expect(query.enabled).toBe(true);
    });
});
