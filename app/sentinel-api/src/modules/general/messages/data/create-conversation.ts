import { type DbClient } from '@sentinel/db';

export type CreateConversationDataArgs = {
    type?: string;
};

/**
 * Creates a new conversation entry.
 *
 * @param dbClient - Kysely database client.
 * @param args - Arguments containing the conversation type.
 */
export async function createConversationData(
    dbClient: DbClient,
    { type = 'DIRECT' }: CreateConversationDataArgs = {},
) {
    const record = await dbClient
        .insertInto('conversations')
        .values({
            type,
        })
        .returning('conversation_id as conversationId')
        .executeTakeFirstOrThrow();

    return record.conversationId;
}
