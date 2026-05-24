import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useConversationsQuery } from './use-conversations-query';
import { getConversations } from '@sentinel/services';
import { MESSAGES_QUERY_KEYS } from '@sentinel/shared/constants';

const mockUseAuthenticatedQueryEnabled = vi.fn(() => true);

// Mock tanstack/react-query
vi.mock('@tanstack/react-query', () => ({
    useQuery: vi.fn((options: any) => {
        if (options.enabled !== false && options.queryFn) {
            options.queryFn();
        }
        return {
            queryKey: options.queryKey,
            enabled: options.enabled,
        };
    }),
}));

// Mock sentinel/services
vi.mock('@sentinel/services', () => ({
    getConversations: vi.fn(),
}));

// Mock api provider hook
vi.mock('../../api-provider', () => ({
    useApi: vi.fn(() => ({ mockClient: true })),
}));

// Mock authentication status hook
vi.mock('../_shared/use-authenticated-query-enabled', () => ({
    useAuthenticatedQueryEnabled: () => mockUseAuthenticatedQueryEnabled(),
}));

describe('useConversationsQuery Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAuthenticatedQueryEnabled.mockReturnValue(true);
    });

    it('sets the correct query key and calls the client function', () => {
        const query = useConversationsQuery() as any;

        expect(query.queryKey).toEqual(MESSAGES_QUERY_KEYS.conversations());
        expect(getConversations).toHaveBeenCalledWith({ mockClient: true });
        expect(query.enabled).toBe(true);
    });

    it('stays disabled when authenticated queries are not allowed', () => {
        mockUseAuthenticatedQueryEnabled.mockReturnValue(false);

        const query = useConversationsQuery() as any;

        expect(query.enabled).toBe(false);
        expect(getConversations).not.toHaveBeenCalled();
    });
});
