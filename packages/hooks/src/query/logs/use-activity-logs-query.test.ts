import { describe, expect, it, vi } from 'vitest';
import { useActivityLogsQuery } from './use-activity-logs-query';
import { getActivityLogs } from '@sentinel/services';
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
    getActivityLogs: vi.fn(),
}));

vi.mock('../../api-provider', () => ({
    useApi: vi.fn(() => ({ mockClient: true })),
}));

vi.mock('../_shared/use-authenticated-query-enabled', () => ({
    useAuthenticatedQueryEnabled: vi.fn(() => true),
}));

describe('useActivityLogsQuery Hook', () => {
    it('sets correct query key and calls the client function', () => {
        const params = { action: 'user.login' };
        const query = useActivityLogsQuery({ params }) as any;

        expect(query.queryKey).toEqual(LOGS_QUERY_KEYS.activity(params));
        expect(getActivityLogs).toHaveBeenCalledWith({ mockClient: true }, params);
        expect(query.enabled).toBe(true);
    });
});
