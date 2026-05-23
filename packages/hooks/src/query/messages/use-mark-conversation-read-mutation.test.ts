import { describe, expect, it, vi } from 'vitest';
import { useMarkConversationReadMutation } from './use-mark-conversation-read-mutation';
import { markConversationRead } from '@sentinel/services';
import { MESSAGES_QUERY_KEYS } from '@sentinel/shared/constants';

const mockInvalidateQueries = vi.fn();

// Mock tanstack/react-query
vi.mock('@tanstack/react-query', () => ({
    useQueryClient: vi.fn(() => ({
        invalidateQueries: mockInvalidateQueries,
    })),
    useMutation: vi.fn((options: any) => {
        const mutateAsync = async (variables: any) => {
            if (options.mutationFn) {
                await options.mutationFn(variables);
            }
            if (options.onSuccess) {
                await options.onSuccess({ success: true }, variables, null);
            }
        };
        return { mutateAsync };
    }),
}));

// Mock sentinel/services
vi.mock('@sentinel/services', () => ({
    markConversationRead: vi.fn(),
}));

// Mock api provider hook
vi.mock('../../api-provider', () => ({
    useApi: vi.fn(() => ({ mockClient: true })),
}));

describe('useMarkConversationReadMutation Hook', () => {
    it('calls markConversationRead and invalidates cache on success', async () => {
        const payload = { conversationId: 'conv-uuid-123' };

        const mutation = useMarkConversationReadMutation();
        await (mutation as any).mutateAsync(payload);

        expect(markConversationRead).toHaveBeenCalledWith(
            { mockClient: true },
            payload.conversationId,
        );
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: MESSAGES_QUERY_KEYS.conversations(),
        });
    });
});
