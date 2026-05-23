import { describe, expect, it, vi } from 'vitest';
import { useConversationMessagesQuery } from './use-conversation-messages-query';
import { getConversationMessages } from '@sentinel/services';
import { MESSAGES_QUERY_KEYS } from '@sentinel/shared/constants';

// Mock tanstack/react-query
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

// Mock sentinel/services
vi.mock('@sentinel/services', () => ({
    getConversationMessages: vi.fn(),
}));

// Mock api provider hook
vi.mock('../../api-provider', () => ({
    useApi: vi.fn(() => ({ mockClient: true })),
}));

// Mock authentication status hook
vi.mock('../_shared/use-authenticated-query-enabled', () => ({
    useAuthenticatedQueryEnabled: vi.fn(() => true),
}));

describe('useConversationMessagesQuery Hook', () => {
    it('sets the correct query key and calls the client function', () => {
        const conversationId = 'conv-uuid-123';
        const query = useConversationMessagesQuery({ conversationId }) as any;

        expect(query.queryKey).toEqual(MESSAGES_QUERY_KEYS.messages(conversationId));
        expect(getConversationMessages).toHaveBeenCalledWith({ mockClient: true }, conversationId);
        expect(query.enabled).toBe(true);
    });
});
