import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import {
    findDirectConversationData,
    createConversationData,
    addConversationParticipantsData,
    createMessageData,
    markConversationReadData,
    getConversationByIdData,
} from '../data';
import { mapConversationDetailRecord, mapMessageRecord } from './message-mapper';

/**
 * Creates a direct 1:1 conversation between two users.
 * If a direct conversation already exists between them, it returns the existing one.
 *
 * @param dbClient - Kysely database client.
 * @param args - Arguments containing userId (sender) and recipientId.
 * @returns Mapped ConversationDetail details.
 */
export async function createDirectConversation(
    dbClient: DbClient,
    { userId, recipientId }: { userId: string; recipientId: string },
) {
    if (userId === recipientId) {
        throw new HTTPException(400, { message: 'Cannot start a conversation with yourself.' });
    }

    // 1. Verify that the recipient exists
    const recipientExists = await dbClient
        .selectFrom('user_profiles')
        .select('user_id')
        .where('user_id', '=', recipientId)
        .executeTakeFirst();

    if (!recipientExists) {
        throw new HTTPException(404, { message: 'Recipient user profile not found.' });
    }

    // 2. Check if a direct conversation already exists
    const existingId = await findDirectConversationData(dbClient, {
        userAId: userId,
        userBId: recipientId,
    });

    if (existingId) {
        const conversation = await getConversationByIdData(dbClient, {
            conversationId: existingId,
            userId,
        });
        if (conversation) {
            return mapConversationDetailRecord(conversation);
        }
    }

    // 3. Create conversation and add participants atomically inside a transaction
    const newConversationId = await dbClient.transaction().execute(async (tx) => {
        const convId = await createConversationData(tx, { type: 'DIRECT' });
        await addConversationParticipantsData(tx, {
            conversationId: convId,
            userIds: [userId, recipientId],
        });
        return convId;
    });

    const newConversation = await getConversationByIdData(dbClient, {
        conversationId: newConversationId,
        userId,
    });

    if (!newConversation) {
        throw new HTTPException(500, { message: 'Failed to retrieve newly created conversation.' });
    }

    return mapConversationDetailRecord(newConversation);
}

/**
 * Sends a message in a conversation.
 * Verifies that the sender is a participant first.
 *
 * @param dbClient - Kysely database client.
 * @param args - Arguments containing conversationId, senderId, and message content.
 * @returns Mapped ConversationMessage.
 */
export async function sendMessage(
    dbClient: DbClient,
    {
        conversationId,
        senderId,
        content,
    }: {
        conversationId: string;
        senderId: string;
        content: string;
    },
) {
    // 1. Verify membership
    const isParticipant = await dbClient
        .selectFrom('conversation_participants')
        .select('conversation_id')
        .where('conversation_id', '=', conversationId)
        .where('user_id', '=', senderId)
        .executeTakeFirst();

    if (!isParticipant) {
        throw new HTTPException(403, {
            message: 'You are not a participant in this conversation.',
        });
    }

    // 2. Create the message
    const record = await createMessageData(dbClient, {
        conversationId,
        senderId,
        content,
    });

    return mapMessageRecord(record);
}

/**
 * Marks a conversation as read by updating the last_read_at timestamp for a user.
 *
 * @param dbClient - Kysely database client.
 * @param args - Arguments containing conversationId and userId.
 * @returns Object indicating success.
 */
export async function markConversationRead(
    dbClient: DbClient,
    { conversationId, userId }: { conversationId: string; userId: string },
) {
    // 1. Verify membership
    const isParticipant = await dbClient
        .selectFrom('conversation_participants')
        .select('conversation_id')
        .where('conversation_id', '=', conversationId)
        .where('user_id', '=', userId)
        .executeTakeFirst();

    if (!isParticipant) {
        throw new HTTPException(403, {
            message: 'You are not a participant in this conversation.',
        });
    }

    // 2. Update last_read_at
    await markConversationReadData(dbClient, { conversationId, userId });

    return { success: true };
}
