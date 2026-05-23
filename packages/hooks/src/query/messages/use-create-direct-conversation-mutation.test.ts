import { describe, expect, it, vi } from 'vitest';
import { useCreateDirectConversationMutation } from './use-create-direct-conversation-mutation';
import { createDirectConversation } from '@sentinel/services';
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
                await options.onSuccess({ conversationId: 'new-conv-123' }, variables, null);
            }
        };
        return { mutateAsync };
    }),
}));

// Mock sentinel/services
vi.mock('@sentinel/services', () => ({
    createDirectConversation: vi.fn(),
}));

// Mock api provider hook
vi.mock('../../api-provider', () => ({
    useApi: vi.fn(() => ({ mockClient: true })),
}));

describe('useCreateDirectConversationMutation Hook', () => {
    it('calls createDirectConversation and invalidates cache on success', async () => {
        const payload = { recipientId: 'recipient-uuid-456' };

        const mutation = useCreateDirectConversationMutation();
        await (mutation as any).mutateAsync(payload);

        expect(createDirectConversation).toHaveBeenCalledWith(
            { mockClient: true },
            payload.recipientId,
        );
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: MESSAGES_QUERY_KEYS.conversations(),
        });
    });
});
