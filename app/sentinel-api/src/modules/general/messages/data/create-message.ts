import { type DbClient } from '@sentinel/db';

export type CreateMessageDataArgs = {
    conversationId: string;
    senderId: string;
    content: string;
    status?: 'SENT' | 'DELIVERED' | 'READ';
};

/**
 * Inserts a new row into the messages table.
 *
 * @param dbClient - Kysely database client.
 * @param args - Arguments representing message properties.
 */
export async function createMessageData(
    dbClient: DbClient,
    { conversationId, senderId, content, status = 'SENT' }: CreateMessageDataArgs,
) {
    const record = await dbClient
        .insertInto('messages')
        .values({
            conversation_id: conversationId,
            sender_id: senderId,
            content,
            status,
        })
        .returning([
            'message_id as messageId',
            'conversation_id as conversationId',
            'sender_id as senderId',
            'content',
            'status',
            'created_at as createdAt',
        ])
        .executeTakeFirstOrThrow();

    return record;
}
