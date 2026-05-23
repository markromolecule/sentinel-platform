import { z } from 'zod';

/**
 * Schema for a participant in a conversation.
 */
export const messageParticipantSchema = z.object({
    userId: z.string().uuid(),
    name: z.string(),
    avatarUrl: z.string().nullable().optional(),
    role: z.string(),
});

/**
 * Message delivery/read status.
 */
export const messageStatusSchema = z.enum(['SENT', 'DELIVERED', 'READ']);

/**
 * Schema for a message preview/summary.
 */
export const messageSummarySchema = z.object({
    messageId: z.string().uuid(),
    conversationId: z.string().uuid(),
    senderId: z.string().uuid(),
    content: z.string(),
    status: messageStatusSchema,
    createdAt: z.string(),
});

/**
 * Schema for a conversation overview with participants, unread count, and the last message.
 */
export const conversationSummarySchema = z.object({
    conversationId: z.string().uuid(),
    type: z.string().nullable().optional(),
    createdAt: z.string(),
    updatedAt: z.string().nullable().optional(),
    participants: z.array(messageParticipantSchema),
    lastMessage: messageSummarySchema.nullable().optional(),
    unreadCount: z.number().int().nonnegative(),
});

/**
 * Schema for a conversation's full details.
 */
export const conversationDetailSchema = z.object({
    conversationId: z.string().uuid(),
    type: z.string().nullable().optional(),
    createdAt: z.string(),
    updatedAt: z.string().nullable().optional(),
    participants: z.array(messageParticipantSchema),
});

/**
 * Response schema for listing conversations.
 */
export const listConversationsResponseSchema = z.object({
    items: z.array(conversationSummarySchema),
});

/**
 * Response schema for listing messages in a conversation.
 */
export const listConversationMessagesResponseSchema = z.object({
    items: z.array(messageSummarySchema),
});
