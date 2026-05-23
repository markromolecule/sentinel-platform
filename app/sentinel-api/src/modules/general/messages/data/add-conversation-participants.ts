import { type DbClient } from '@sentinel/db';

export type AddConversationParticipantsDataArgs = {
    conversationId: string;
    userIds: string[];
};

/**
 * Attaches multiple users to a conversation as participants.
 *
 * @param dbClient - Kysely database client.
 * @param args - Arguments containing conversationId and userIds array.
 */
export async function addConversationParticipantsData(
    dbClient: DbClient,
    { conversationId, userIds }: AddConversationParticipantsDataArgs,
) {
    if (userIds.length === 0) return;

    const values = userIds.map((userId) => ({
        conversation_id: conversationId,
        user_id: userId,
    }));

    await dbClient.insertInto('conversation_participants').values(values).execute();
}
