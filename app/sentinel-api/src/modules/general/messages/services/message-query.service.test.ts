import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HTTPException } from 'hono/http-exception';
import { listConversations, listConversationMessages } from './message-query.service';
import * as dataLayer from '../data';

vi.mock('../data', () => ({
    getConversationsData: vi.fn(),
    getConversationMessagesData: vi.fn(),
}));

describe('message-query.service', () => {
    const mockDbClient = {} as any;
    const userId = 'a7c93cb6-bce7-440a-9db1-3ef5a9b9a67a';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('listConversations', () => {
        it('should retrieve mapped conversations list', async () => {
            const mockDbRecords = [
                {
                    conversationId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
                    type: 'DIRECT',
                    createdAt: new Date('2026-05-23T10:00:00Z'),
                    updatedAt: null,
                    participants: [
                        {
                            userId: 'a7c93cb6-bce7-440a-9db1-3ef5a9b9a67a',
                            name: 'User 1',
                            avatarUrl: 'https://example.com/avatar.png',
                            role: 'instructor',
                        },
                    ],
                    lastMessage: {
                        messageId: 'b3cd17f8-fb3a-4be0-80de-4ff45037d032',
                        conversationId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
                        senderId: 'a7c93cb6-bce7-440a-9db1-3ef5a9b9a67a',
                        content: 'Hello!',
                        status: 'SENT',
                        createdAt: new Date('2026-05-23T10:05:00Z'),
                    },
                    unreadCount: 0,
                },
            ];

            vi.mocked(dataLayer.getConversationsData).mockResolvedValue(mockDbRecords as any);

            const result = await listConversations(mockDbClient, { userId });

            expect(dataLayer.getConversationsData).toHaveBeenCalledWith(mockDbClient, { userId });
            expect(result).toHaveLength(1);
            expect(result[0].conversationId).toBe('9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d');
            expect(result[0].lastMessage?.content).toBe('Hello!');
            expect(result[0].lastMessage?.createdAt).toBe('2026-05-23T10:05:00.000Z');
        });
    });

    describe('listConversationMessages', () => {
        const conversationId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';

        it('should return list of mapped messages if user is a participant', async () => {
            const mockDbMessages = [
                {
                    messageId: 'b3cd17f8-fb3a-4be0-80de-4ff45037d032',
                    conversationId,
                    senderId: userId,
                    content: 'Hello there!',
                    status: 'SENT',
                    createdAt: new Date('2026-05-23T10:00:00Z'),
                },
            ];

            vi.mocked(dataLayer.getConversationMessagesData).mockResolvedValue(
                mockDbMessages as any,
            );

            const result = await listConversationMessages(mockDbClient, { conversationId, userId });

            expect(dataLayer.getConversationMessagesData).toHaveBeenCalledWith(mockDbClient, {
                conversationId,
                userId,
            });
            expect(result).toHaveLength(1);
            expect(result[0].content).toBe('Hello there!');
            expect(result[0].createdAt).toBe('2026-05-23T10:00:00.000Z');
        });

        it('should throw 403 HTTPException if user is not a participant', async () => {
            vi.mocked(dataLayer.getConversationMessagesData).mockResolvedValue(null);

            await expect(
                listConversationMessages(mockDbClient, { conversationId, userId }),
            ).rejects.toThrowError(
                new HTTPException(403, {
                    message: 'You are not a participant in this conversation.',
                }),
            );
        });
    });
});
