import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { getConversationsData, getConversationMessagesData } from '../data';
import { mapConversationSummaryRecord, mapMessageRecord } from './message-mapper';

/**
 * Lists all conversations the user is participating in.
 *
 * @param dbClient - Kysely database client.
 * @param args - Arguments containing userId.
 * @returns List of conversations.
 */
export async function listConversations(dbClient: DbClient, { userId }: { userId: string }) {
    const records = await getConversationsData(dbClient, { userId });
    return records.map(mapConversationSummaryRecord);
}

/**
 * Lists all messages in a conversation.
 * Throws a 403 HTTPException if the requesting user is not a participant.
 *
 * @param dbClient - Kysely database client.
 * @param args - Arguments containing conversationId and userId.
 * @returns List of messages in the conversation.
 */
export async function listConversationMessages(
    dbClient: DbClient,
    { conversationId, userId }: { conversationId: string; userId: string },
) {
    const records = await getConversationMessagesData(dbClient, { conversationId, userId });

    if (records === null) {
        throw new HTTPException(403, {
            message: 'You are not a participant in this conversation.',
        });
    }

    return records.map(mapMessageRecord);
}
