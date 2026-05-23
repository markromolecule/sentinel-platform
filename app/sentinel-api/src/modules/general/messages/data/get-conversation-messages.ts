import { type DbClient } from '@sentinel/db';

export type GetConversationMessagesDataArgs = {
    conversationId: string;
    userId: string;
};

/**
 * Retrieves all messages in a conversation.
 * Verifies that the requesting user is a participant in that conversation.
 * Returns null if the user is not a participant.
 *
 * @param dbClient - Kysely database client.
 * @param args - Arguments containing conversationId and requesting userId.
 */
export async function getConversationMessagesData(
    dbClient: DbClient,
    { conversationId, userId }: GetConversationMessagesDataArgs,
) {
    // 1. Verify that the user is a participant of the conversation
    const isParticipant = await dbClient
        .selectFrom('conversation_participants')
        .select('conversation_id')
        .where('conversation_id', '=', conversationId)
        .where('user_id', '=', userId)
        .executeTakeFirst();

    if (!isParticipant) {
        return null;
    }

    // 2. Fetch all messages in chronological order
    return await dbClient
        .selectFrom('messages')
        .select([
            'message_id as messageId',
            'conversation_id as conversationId',
            'sender_id as senderId',
            'content',
            'status',
            'created_at as createdAt',
        ])
        .where('conversation_id', '=', conversationId)
        .orderBy('created_at', 'asc')
        .execute();
}
