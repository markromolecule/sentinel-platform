import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

export type GetConversationByIdDataArgs = {
    conversationId: string;
    userId: string;
};

/**
 * Retrieves a conversation by its ID, verifying that the user is a participant.
 * Returns null if the conversation does not exist or the user is not a participant.
 *
 * @param dbClient - Kysely database client.
 * @param args - Arguments containing conversationId and userId.
 */
export async function getConversationByIdData(
    dbClient: DbClient,
    { conversationId, userId }: GetConversationByIdDataArgs,
) {
    // 1. Verify membership
    const isParticipant = await dbClient
        .selectFrom('conversation_participants')
        .select('conversation_id')
        .where('conversation_id', '=', conversationId)
        .where('user_id', '=', userId)
        .executeTakeFirst();

    if (!isParticipant) {
        return null;
    }

    // 2. Fetch conversation details
    return await dbClient
        .selectFrom('conversations as c')
        .select([
            'c.conversation_id as conversationId',
            'c.type',
            'c.created_at as createdAt',
            'c.updated_at as updatedAt',
            sql<any>`(
                select coalesce(json_agg(json_build_object(
                    'userId', up.user_id,
                    'name', coalesce(nullif(trim(concat_ws(' ', up.first_name, up.last_name)), ''), 'User'),
                    'avatarUrl', coalesce(up.avatar_url, au.raw_user_meta_data->>'avatar_url', au.raw_user_meta_data->>'picture'),
                    'role', coalesce(r.role_name, 'student'),
                    'status', up.status,
                    'lastSeenAt', up.last_seen_at,
                    'institution', case
                        when inst.id is not null then json_build_object(
                            'id', inst.id,
                            'name', inst.name
                        )
                        else null
                    end
                )), '[]'::json)
                from conversation_participants cp_inner
                join user_profiles up on up.user_id = cp_inner.user_id
                left join auth.users au on au.id = up.user_id
                left join institutions inst on inst.id = up.institution_id
                left join user_roles ur on ur.user_id = up.user_id
                left join roles r on r.role_id = ur.role_id
                where cp_inner.conversation_id = c.conversation_id
            )`.as('participants'),
        ])
        .where('c.conversation_id', '=', conversationId)
        .executeTakeFirst();
}
