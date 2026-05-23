import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useMessageRealtime } from './use-message-realtime';

const mockInvalidateQueries = vi.fn();
const mockOn = vi.fn().mockImplementation(() => ({
    on: mockOn,
    subscribe: vi.fn(),
}));
const mockChannel = vi.fn().mockImplementation(() => ({
    on: mockOn,
    subscribe: vi.fn(),
}));
const mockRemoveChannel = vi.fn();

// Mock React
vi.mock('react', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react')>();
    return {
        ...actual,
        useEffect: vi.fn((fn) => fn()),
    };
});

// Mock tanstack/react-query
vi.mock('@tanstack/react-query', () => ({
    useQueryClient: vi.fn(() => ({
        invalidateQueries: mockInvalidateQueries,
    })),
}));

// Mock auth-provider
vi.mock('./auth-provider', () => ({
    useAuth: vi.fn(() => ({
        supabase: {
            channel: mockChannel,
            removeChannel: mockRemoveChannel,
        },
        user: { id: 'user-uuid-111' },
    })),
}));

describe('useMessageRealtime Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('subscribes to postgres_changes for specific conversation when conversationId is provided', () => {
        const conversationId = 'conv-uuid-123';
        useMessageRealtime({ conversationId });

        expect(mockChannel).toHaveBeenCalledWith(`messages:${conversationId}:user-uuid-111`);
        expect(mockOn).toHaveBeenCalledWith(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${conversationId}`,
            },
            expect.any(Function),
        );
        expect(mockOn).toHaveBeenCalledWith(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'conversation_participants',
                filter: `user_id=eq.user-uuid-111`,
            },
            expect.any(Function),
        );
    });

    it('subscribes to all postgres_changes for messages when conversationId is not provided', () => {
        useMessageRealtime();

        expect(mockChannel).toHaveBeenCalledWith(`messages:all:user-uuid-111`);
        expect(mockOn).toHaveBeenCalledWith(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'messages',
            },
            expect.any(Function),
        );
    });
});
