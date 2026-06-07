import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminMessagesPage from './page';

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

describe('AdminMessagesPage - Replicated Layout and Functionality Tests', () => {
    const mockMutateAsync = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        mockUseProfileQuery.mockReturnValue({
            profile: { id: 'current-user-id', name: 'Admin User' },
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
        const { rerender } = render(<AdminMessagesPage />);

        await waitFor(() => {
            expect(mockMutateAsync).toHaveBeenCalledTimes(1);
        });

        expect(mockMutateAsync).toHaveBeenCalledWith({ recipientId: 'target-user-123' });

        // Trigger rerenders/updates
        rerender(<AdminMessagesPage />);

        await new Promise((resolve) => setTimeout(resolve, 50));

        // Should still only be called once due to the hasFiredDeepLinkRef guard
        expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    });

    it('does not render a card wrapper containing rounded-xl or border', () => {
        const { container } = render(<AdminMessagesPage />);
        const firstDiv = container.firstChild as HTMLElement;
        expect(firstDiv.className).not.toContain('rounded-xl');
        expect(firstDiv.className).not.toContain('border');
    });
});
