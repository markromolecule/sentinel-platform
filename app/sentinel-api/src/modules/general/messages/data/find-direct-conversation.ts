import { type DbClient } from '@sentinel/db';

export type FindDirectConversationDataArgs = {
    userAId: string;
    userBId: string;
};

/**
 * Checks if a 1:1 direct conversation already exists between two users.
 * Returns the conversation ID if it exists, otherwise null.
 *
 * @param dbClient - Kysely database client.
 * @param args - Object containing both user IDs.
 */
export async function findDirectConversationData(
    dbClient: DbClient,
    { userAId, userBId }: FindDirectConversationDataArgs,
) {
    const record = await dbClient
        .selectFrom('conversations as c')
        .select('c.conversation_id as conversationId')
        .innerJoin('conversation_participants as cp1', 'cp1.conversation_id', 'c.conversation_id')
        .innerJoin('conversation_participants as cp2', 'cp2.conversation_id', 'c.conversation_id')
        .where('c.type', '=', 'DIRECT')
        .where('cp1.user_id', '=', userAId)
        .where('cp2.user_id', '=', userBId)
        .executeTakeFirst();

    return record?.conversationId || null;
}
