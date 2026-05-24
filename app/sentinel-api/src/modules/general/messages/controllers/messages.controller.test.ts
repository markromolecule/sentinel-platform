import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import { MessagesService } from '../messages.service';
import {
    getConversationsRoute,
    getConversationsRouteHandler,
} from './get-conversations.controller';
import {
    getConversationMessagesRoute,
    getConversationMessagesRouteHandler,
} from './get-conversation-messages.controller';
import {
    createDirectConversationRoute,
    createDirectConversationRouteHandler,
} from './create-direct-conversation.controller';
import { sendMessageRoute, sendMessageRouteHandler } from './send-message.controller';
import {
    markConversationReadRoute,
    markConversationReadRouteHandler,
} from './mark-conversation-read.controller';

vi.mock('../messages.service', () => ({
    MessagesService: {
        listConversations: vi.fn(),
        listConversationMessages: vi.fn(),
        createDirectConversation: vi.fn(),
        sendMessage: vi.fn(),
        markConversationRead: vi.fn(),
    },
}));

describe('Messages Controllers', () => {
    const userId = 'a7c93cb6-bce7-440a-9db1-3ef5a9b9a67a';
    const conversationId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
    const recipientId = '550e8400-e29b-41d4-a716-446655440000';

    function createTestApp(permissionKeys: string[]) {
        const app = new OpenAPIHono();

        app.use('*', async (c, next) => {
            c.set('dbClient', {} as any);
            c.set('user', { id: userId } as any);
            c.set('activePermissionKeys', permissionKeys);
            await next();
        });

        app.openapi(getConversationsRoute, getConversationsRouteHandler);
        app.openapi(getConversationMessagesRoute, getConversationMessagesRouteHandler);
        app.openapi(createDirectConversationRoute, createDirectConversationRouteHandler);
        app.openapi(sendMessageRoute, sendMessageRouteHandler);
        app.openapi(markConversationReadRoute, markConversationReadRouteHandler);

        return app;
    }

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET /conversations', () => {
        it('fetches list of conversations when authorized', async () => {
            const mockConversations = [
                {
                    conversationId,
                    type: 'DIRECT',
                    unreadCount: 0,
                    participants: [
                        {
                            userId,
                            name: 'Jordan Cruz',
                            role: 'instructor',
                            status: 'ACTIVE',
                            institution: {
                                id: '550e8400-e29b-41d4-a716-446655440000',
                                name: 'Sentinel Academy',
                            },
                            lastSeenAt: '2026-05-24T08:30:00.000Z',
                        },
                    ],
                },
            ];
            vi.spyOn(MessagesService, 'listConversations').mockResolvedValue(
                mockConversations as any,
            );

            const app = createTestApp(['messages:view']);
            const res = await app.request('/conversations');
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(MessagesService.listConversations).toHaveBeenCalledWith(expect.anything(), {
                userId,
            });
            expect(body).toEqual({
                success: true,
                message: 'Conversations fetched successfully',
                data: mockConversations,
            });
            expect(body.data[0].participants[0].institution.name).toBe('Sentinel Academy');
            expect(body.data[0].participants[0].status).toBe('ACTIVE');
        });

        it('returns 403 Forbidden if caller lacks messages:view permission', async () => {
            const app = createTestApp([]);
            const res = await app.request('/conversations');

            expect(res.status).toBe(403);
            expect(MessagesService.listConversations).not.toHaveBeenCalled();
        });
    });

    describe('GET /conversations/:conversationId/messages', () => {
        it('fetches messages of a conversation when authorized', async () => {
            const mockMessages = [{ messageId: 'm1', conversationId, content: 'Hello' }];
            vi.spyOn(MessagesService, 'listConversationMessages').mockResolvedValue(
                mockMessages as any,
            );

            const app = createTestApp(['messages:view']);
            const res = await app.request(`/conversations/${conversationId}/messages`);
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(MessagesService.listConversationMessages).toHaveBeenCalledWith(
                expect.anything(),
                {
                    conversationId,
                    userId,
                },
            );
            expect(body).toEqual({
                success: true,
                message: 'Messages fetched successfully',
                data: mockMessages,
            });
        });

        it('returns 403 if caller lacks permission', async () => {
            const app = createTestApp([]);
            const res = await app.request(`/conversations/${conversationId}/messages`);

            expect(res.status).toBe(403);
        });
    });

    describe('POST /conversations/direct', () => {
        it('establishes a direct conversation when authorized', async () => {
            const mockConv = { conversationId, type: 'DIRECT', participants: [] };
            vi.spyOn(MessagesService, 'createDirectConversation').mockResolvedValue(
                mockConv as any,
            );

            const app = createTestApp(['messages:create']);
            const res = await app.request('/conversations/direct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipientId }),
            });
            const body = await res.json();

            expect(res.status).toBe(201);
            expect(MessagesService.createDirectConversation).toHaveBeenCalledWith(
                expect.anything(),
                {
                    userId,
                    recipientId,
                },
            );
            expect(body).toEqual({
                success: true,
                message: 'Conversation established successfully',
                data: mockConv,
            });
        });

        it('returns 400 for bad input payload', async () => {
            const app = createTestApp(['messages:create']);
            const res = await app.request('/conversations/direct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipientId: 'invalid-uuid' }),
            });

            expect(res.status).toBe(400);
        });
    });

    describe('POST /conversations/:conversationId/messages', () => {
        it('sends a message when authorized', async () => {
            const mockMsg = { messageId: 'msg-123', conversationId, content: 'Hi' };
            vi.spyOn(MessagesService, 'sendMessage').mockResolvedValue(mockMsg as any);

            const app = createTestApp(['messages:create']);
            const res = await app.request(`/conversations/${conversationId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: 'Hi' }),
            });
            const body = await res.json();

            expect(res.status).toBe(201);
            expect(MessagesService.sendMessage).toHaveBeenCalledWith(expect.anything(), {
                conversationId,
                senderId: userId,
                content: 'Hi',
            });
            expect(body).toEqual({
                success: true,
                message: 'Message sent successfully',
                data: mockMsg,
            });
        });
    });

    describe('POST /conversations/:conversationId/read', () => {
        it('marks a conversation as read when authorized', async () => {
            vi.spyOn(MessagesService, 'markConversationRead').mockResolvedValue({ success: true });

            const app = createTestApp(['messages:view']);
            const res = await app.request(`/conversations/${conversationId}/read`, {
                method: 'POST',
            });
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(MessagesService.markConversationRead).toHaveBeenCalledWith(expect.anything(), {
                conversationId,
                userId,
            });
            expect(body).toEqual({
                success: true,
                message: 'Conversation marked as read successfully',
                data: { success: true },
            });
        });
    });
});
