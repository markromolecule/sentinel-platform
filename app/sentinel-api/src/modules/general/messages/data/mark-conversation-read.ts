import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

export type MarkConversationReadDataArgs = {
    conversationId: string;
    userId: string;
};

/**
 * Updates the last_read_at timestamp of a participant in a conversation to the current time.
 *
 * @param dbClient - Kysely database client.
 * @param args - Arguments containing conversationId and userId.
 */
export async function markConversationReadData(
    dbClient: DbClient,
    { conversationId, userId }: MarkConversationReadDataArgs,
) {
    await dbClient
        .updateTable('conversation_participants')
        .set({
            last_read_at: sql`NOW()`,
        })
        .where('conversation_id', '=', conversationId)
        .where('user_id', '=', userId)
        .execute();
}
