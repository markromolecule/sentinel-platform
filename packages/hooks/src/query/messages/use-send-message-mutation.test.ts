import { describe, expect, it, vi } from 'vitest';
import { useSendMessageMutation } from './use-send-message-mutation';
import { sendMessage } from '@sentinel/services';
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
                await options.onSuccess({ messageId: 'new-msg-123' }, variables, null);
            }
        };
        return { mutateAsync };
    }),
}));

// Mock sentinel/services
vi.mock('@sentinel/services', () => ({
    sendMessage: vi.fn(),
}));

// Mock api provider hook
vi.mock('../../api-provider', () => ({
    useApi: vi.fn(() => ({ mockClient: true })),
}));

describe('useSendMessageMutation Hook', () => {
    it('calls sendMessage and invalidates cache on success', async () => {
        const payload = { conversationId: 'conv-uuid-123', content: 'Hello there!' };

        const mutation = useSendMessageMutation();
        await (mutation as any).mutateAsync(payload);

        expect(sendMessage).toHaveBeenCalledWith(
            { mockClient: true },
            payload.conversationId,
            payload.content,
        );
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: MESSAGES_QUERY_KEYS.messages(payload.conversationId),
        });
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: MESSAGES_QUERY_KEYS.conversations(),
        });
    });
});
