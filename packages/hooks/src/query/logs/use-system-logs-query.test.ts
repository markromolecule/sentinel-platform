import { describe, expect, it, vi } from 'vitest';
import { useSystemLogsQuery } from './use-system-logs-query';
import { getSystemLogs } from '@sentinel/services';
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
    getSystemLogs: vi.fn(),
}));

vi.mock('../../api-provider', () => ({
    useApi: vi.fn(() => ({ mockClient: true })),
}));

vi.mock('../_shared/use-authenticated-query-enabled', () => ({
    useAuthenticatedQueryEnabled: vi.fn(() => true),
}));

describe('useSystemLogsQuery Hook', () => {
    it('sets correct query key and calls the client function', () => {
        const params = { userId: '123-uuid' };
        const query = useSystemLogsQuery({ params }) as any;

        expect(query.queryKey).toEqual(LOGS_QUERY_KEYS.system(params));
        expect(getSystemLogs).toHaveBeenCalledWith({ mockClient: true }, params);
        expect(query.enabled).toBe(true);
    });
});
