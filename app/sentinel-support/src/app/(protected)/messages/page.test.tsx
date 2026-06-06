import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SupportMessagesPage from './page';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useSearchParams: () => new URLSearchParams('userId=target-user-123'),
    useRouter: () => ({
        push: mockPush,
    }),
}));

const {
    mockUseConversationsQuery,
    mockUseConversationMessagesQuery,
    mockUseSendMessageMutation,
    mockUseMarkConversationReadMutation,
    mockUseMessageRealtime,
    mockUsePresence,
    mockUseProfileQuery,
    mockUseUsersQuery,
    mockUseCreateDirectConversationMutation,
} = vi.hoisted(() => ({
    mockUseConversationsQuery: vi.fn(),
    mockUseConversationMessagesQuery: vi.fn(),
    mockUseSendMessageMutation: vi.fn(),
    mockUseMarkConversationReadMutation: vi.fn(),
    mockUseMessageRealtime: vi.fn(),
    mockUsePresence: vi.fn(),
    mockUseProfileQuery: vi.fn(),
    mockUseUsersQuery: vi.fn(),
    mockUseCreateDirectConversationMutation: vi.fn(),
}));

vi.mock('@sentinel/hooks', () => ({
    useConversationsQuery: mockUseConversationsQuery,
    useConversationMessagesQuery: mockUseConversationMessagesQuery,
    useSendMessageMutation: mockUseSendMessageMutation,
    useMarkConversationReadMutation: mockUseMarkConversationReadMutation,
    useMessageRealtime: mockUseMessageRealtime,
    usePresence: mockUsePresence,
    useProfileQuery: mockUseProfileQuery,
    useUsersQuery: mockUseUsersQuery,
    useCreateDirectConversationMutation: mockUseCreateDirectConversationMutation,
}));

vi.mock('./_components/message-list', () => ({
    MessageList: () => <div data-testid="message-list">Message List</div>,
}));

vi.mock('./_components/chat-window', () => ({
    ChatWindow: () => <div data-testid="chat-window">Chat Window</div>,
}));

describe('SupportMessagesPage - Phase 1 Verification', () => {
    const mockMutateAsync = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        mockUseProfileQuery.mockReturnValue({
            profile: { id: 'current-user-id', name: 'Support User' },
            isLoading: false,
        });

        mockUsePresence.mockReturnValue({
            onlineUserIds: new Set(),
        });

        mockUseConversationsQuery.mockReturnValue({
            data: [],
            isLoading: false,
        });

        mockUseConversationMessagesQuery.mockReturnValue({
            data: [],
            isLoading: false,
        });

        mockUseSendMessageMutation.mockReturnValue({
            mutateAsync: vi.fn(),
        });

        mockUseMarkConversationReadMutation.mockReturnValue({
            mutate: vi.fn(),
        });

        mockUseCreateDirectConversationMutation.mockReturnValue({
            mutateAsync: mockMutateAsync,
            isPending: false,
        });

        mockUseUsersQuery.mockReturnValue({
            data: [],
            isLoading: false,
        });
    });

    it('should call handleStartConversation once per targetUserId parameter, and avoid duplicate calls', async () => {
        const { rerender } = render(<SupportMessagesPage />);

        await waitFor(() => {
            expect(mockMutateAsync).toHaveBeenCalledTimes(1);
        });

        expect(mockMutateAsync).toHaveBeenCalledWith({ recipientId: 'target-user-123' });

        // Trigger rerenders/updates (simulated by rerendering the tree)
        rerender(<SupportMessagesPage />);

        await new Promise((resolve) => setTimeout(resolve, 50));

        // Should still only be called once due to the hasFiredDeepLinkRef guard
        expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    });
});
