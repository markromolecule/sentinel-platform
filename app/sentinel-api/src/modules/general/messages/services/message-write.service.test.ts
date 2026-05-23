import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HTTPException } from 'hono/http-exception';
import {
    createDirectConversation,
    sendMessage,
    markConversationRead,
} from './message-write.service';
import * as dataLayer from '../data';

vi.mock('../data', () => ({
    findDirectConversationData: vi.fn(),
    createConversationData: vi.fn(),
    addConversationParticipantsData: vi.fn(),
    createMessageData: vi.fn(),
    markConversationReadData: vi.fn(),
    getConversationByIdData: vi.fn(),
}));

describe('message-write.service', () => {
    const userId = 'a7c93cb6-bce7-440a-9db1-3ef5a9b9a67a';
    const recipientId = '550e8400-e29b-41d4-a716-446655440000';
    const conversationId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';

    let mockDbClient: any;

    beforeEach(() => {
        vi.clearAllMocks();

        // Standard mock Kysely DbClient with selectFrom and transaction support
        mockDbClient = {
            selectFrom: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            executeTakeFirst: vi.fn(),
            transaction: vi.fn().mockReturnValue({
                execute: vi.fn((cb) => cb(mockDbClient)),
            }),
        } as any;
    });

    describe('createDirectConversation', () => {
        it('should throw 400 if user starts conversation with themselves', async () => {
            await expect(
                createDirectConversation(mockDbClient, { userId, recipientId: userId }),
            ).rejects.toThrowError(
                new HTTPException(400, { message: 'Cannot start a conversation with yourself.' }),
            );
        });

        it('should throw 404 if recipient profile does not exist', async () => {
            mockDbClient.executeTakeFirst.mockResolvedValueOnce(undefined); // Recipient lookup fails

            await expect(
                createDirectConversation(mockDbClient, { userId, recipientId }),
            ).rejects.toThrowError(
                new HTTPException(404, { message: 'Recipient user profile not found.' }),
            );
        });

        it('should return existing conversation if found', async () => {
            // 1. Recipient check
            mockDbClient.executeTakeFirst.mockResolvedValueOnce({ user_id: recipientId });
            // 2. Existing check
            vi.mocked(dataLayer.findDirectConversationData).mockResolvedValue(conversationId);
            // 3. Get by ID
            const mockConv = {
                conversationId,
                type: 'DIRECT',
                createdAt: new Date(),
                participants: [],
            };
            vi.mocked(dataLayer.getConversationByIdData).mockResolvedValue(mockConv as any);

            const result = await createDirectConversation(mockDbClient, { userId, recipientId });

            expect(dataLayer.findDirectConversationData).toHaveBeenCalledWith(mockDbClient, {
                userAId: userId,
                userBId: recipientId,
            });
            expect(result.conversationId).toBe(conversationId);
            expect(dataLayer.createConversationData).not.toHaveBeenCalled();
        });

        it('should create new conversation if not exists', async () => {
            // 1. Recipient check
            mockDbClient.executeTakeFirst.mockResolvedValueOnce({ user_id: recipientId });
            // 2. Existing check -> null
            vi.mocked(dataLayer.findDirectConversationData).mockResolvedValue(null);
            // 3. Create conversation -> new ID
            vi.mocked(dataLayer.createConversationData).mockResolvedValue(conversationId);
            // 4. Get by ID
            const mockConv = {
                conversationId,
                type: 'DIRECT',
                createdAt: new Date(),
                participants: [
                    { userId, name: 'User A', role: 'instructor' },
                    { userId: recipientId, name: 'User B', role: 'student' },
                ],
            };
            vi.mocked(dataLayer.getConversationByIdData).mockResolvedValue(mockConv as any);

            const result = await createDirectConversation(mockDbClient, { userId, recipientId });

            expect(dataLayer.createConversationData).toHaveBeenCalled();
            expect(dataLayer.addConversationParticipantsData).toHaveBeenCalledWith(mockDbClient, {
                conversationId,
                userIds: [userId, recipientId],
            });
            expect(result.conversationId).toBe(conversationId);
        });
    });

    describe('sendMessage', () => {
        const content = 'Hello!';

        it('should send a message if sender is a participant', async () => {
            // 1. Verify participant -> success
            mockDbClient.executeTakeFirst.mockResolvedValueOnce({
                conversation_id: conversationId,
            });

            const mockMessage = {
                messageId: 'b3cd17f8-fb3a-4be0-80de-4ff45037d032',
                conversationId,
                senderId: userId,
                content,
                status: 'SENT',
                createdAt: new Date(),
            };
            vi.mocked(dataLayer.createMessageData).mockResolvedValue(mockMessage as any);

            const result = await sendMessage(mockDbClient, {
                conversationId,
                senderId: userId,
                content,
            });

            expect(dataLayer.createMessageData).toHaveBeenCalledWith(mockDbClient, {
                conversationId,
                senderId: userId,
                content,
            });
            expect(result.content).toBe(content);
        });

        it('should throw 403 if sender is not a participant', async () => {
            // 1. Verify participant -> fails
            mockDbClient.executeTakeFirst.mockResolvedValueOnce(undefined);

            await expect(
                sendMessage(mockDbClient, { conversationId, senderId: userId, content }),
            ).rejects.toThrowError(
                new HTTPException(403, {
                    message: 'You are not a participant in this conversation.',
                }),
            );
        });
    });

    describe('markConversationRead', () => {
        it('should mark conversation as read if user is participant', async () => {
            // 1. Verify participant -> success
            mockDbClient.executeTakeFirst.mockResolvedValueOnce({
                conversation_id: conversationId,
            });

            const result = await markConversationRead(mockDbClient, { conversationId, userId });

            expect(dataLayer.markConversationReadData).toHaveBeenCalledWith(mockDbClient, {
                conversationId,
                userId,
            });
            expect(result.success).toBe(true);
        });

        it('should throw 403 if user is not participant', async () => {
            // 1. Verify participant -> fails
            mockDbClient.executeTakeFirst.mockResolvedValueOnce(undefined);

            await expect(
                markConversationRead(mockDbClient, { conversationId, userId }),
            ).rejects.toThrowError(
                new HTTPException(403, {
                    message: 'You are not a participant in this conversation.',
                }),
            );
        });
    });
});
