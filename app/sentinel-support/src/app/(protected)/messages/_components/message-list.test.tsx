import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { MessageList } from './message-list';

vi.mock('@sentinel/ui', () => ({
    cn: (...inputs: any[]) => inputs.filter(Boolean).join(' '),
    Avatar: ({ children }: any) => <div data-testid="avatar">{children}</div>,
    AvatarFallback: ({ children }: any) => <div data-testid="avatar-fallback">{children}</div>,
    AvatarImage: ({ src, alt }: any) => <img data-testid="avatar-image" src={src} alt={alt} />,
    SearchBar: ({ value, onChange, placeholder }: any) => (
        <input
            data-testid="search-bar"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
        />
    ),
    Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

describe('MessageList - Phase 2 Verification', () => {
    const defaultProps = {
        conversations: [],
        selectedId: null,
        onSelect: vi.fn(),
        searchTerm: '',
        onSearchChange: vi.fn(),
        showDirectory: false,
        onToggleDirectory: vi.fn(),
        directoryUsers: [],
        onSelectUser: vi.fn(),
        isCreatingConversation: false,
    };

    it('should skip rendering a conversation if it has zero participants, without crashing', () => {
        const conversationsWithNoParticipants = [
            {
                id: 'conversation-1',
                participants: [], // empty participants list
                lastMessage: {
                    id: 'msg-1',
                    senderId: 'user-2',
                    content: 'Hello World',
                    timestamp: new Date().toISOString(),
                    isRead: false,
                },
                unreadCount: 1,
            },
        ];

        // Should not crash when rendering
        const { container } = render(
            <MessageList {...defaultProps} conversations={conversationsWithNoParticipants} />,
        );

        // Since the only conversation has no participants, it should return null for that item
        // and we should see "No conversations yet..." or no conversation items rendered
        expect(container.querySelector('[data-testid="avatar"]')).toBeNull();
    });

    it('should successfully render a conversation that has participants', () => {
        const conversationsWithParticipants = [
            {
                id: 'conversation-1',
                participants: [
                    {
                        id: 'user-2',
                        name: 'John Doe',
                        avatar: 'https://example.com/avatar.png',
                        status: 'online' as const,
                        role: 'student' as const,
                    },
                ],
                lastMessage: {
                    id: 'msg-1',
                    senderId: 'user-2',
                    content: 'Hello World',
                    timestamp: new Date().toISOString(),
                    isRead: false,
                },
                unreadCount: 1,
            },
        ];

        const { getByText, getByTestId } = render(
            <MessageList {...defaultProps} conversations={conversationsWithParticipants} />,
        );

        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('Hello World')).toBeTruthy();
        expect(getByTestId('avatar-image')).toBeTruthy();
    });
});
