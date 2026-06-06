import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

export type GetConversationsDataArgs = {
    userId: string;
};

/**
 * Retrieves the current user's conversations, including participants,
 * the last message, and the unread message count.
 *
 * @param dbClient - Kysely database client.
 * @param args - Arguments including current user ID.
 */
export async function getConversationsData(
    dbClient: DbClient,
    { userId }: GetConversationsDataArgs,
) {
    const records = await dbClient
        .selectFrom('conversation_participants as cp')
        .innerJoin('conversations as c', 'c.conversation_id', 'cp.conversation_id')
        .select([
            'c.conversation_id as conversationId',
            'c.type',
            'c.created_at as createdAt',
            'c.updated_at as updatedAt',
            sql<any>`(
                select coalesce(json_agg(json_build_object(
                    'userId', up.user_id,
                    'name', coalesce(nullif(trim(concat_ws(' ', up.first_name, up.last_name)), ''), 'User'),
                    'avatarUrl', up.avatar_url,
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
                left join institutions inst on inst.id = up.institution_id
                left join user_roles ur on ur.user_id = up.user_id
                left join roles r on r.role_id = ur.role_id
                where cp_inner.conversation_id = cp.conversation_id
            )`.as('participants'),
            sql<any>`(
                select json_build_object(
                    'messageId', m.message_id,
                    'conversationId', m.conversation_id,
                    'senderId', m.sender_id,
                    'content', m.content,
                    'status', m.status,
                    'createdAt', m.created_at
                )
                from messages m
                where m.conversation_id = cp.conversation_id
                order by m.created_at desc
                limit 1
            )`.as('lastMessage'),
            sql<number>`(
                select count(m.message_id)::int
                from messages m
                where m.conversation_id = cp.conversation_id
                  and m.sender_id != ${userId}
                  and (cp.last_read_at is null or m.created_at > cp.last_read_at)
            )`.as('unreadCount'),
        ])
        .where('cp.user_id', '=', userId) // Scoped to current user only — prevents cross-user data leaks
        .orderBy(
            sql`coalesce(
                (select m.created_at from messages m where m.conversation_id = cp.conversation_id order by m.created_at desc limit 1),
                c.created_at
            )`,
            'desc',
        )
        .execute();

    return records;
}
