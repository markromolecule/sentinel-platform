import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';
import type { NotificationStatusType } from '@sentinel/shared/schema';

export type GetNotificationsDataArgs = {
    dbClient: DbClient;
    recipientUserId: string;
    institutionId?: string;
    status?: NotificationStatusType;
    limit?: number;
};

export async function getNotificationsData(args: GetNotificationsDataArgs) {
    const { dbClient, recipientUserId, institutionId, status, limit = 20 } = args;

    let itemsQuery = dbClient
        .selectFrom('notifications as n')
        .leftJoin('user_profiles as actor_profile', 'actor_profile.user_id', 'n.actor_user_id')
        .select([
            'n.notification_id as id',
            'n.title',
            'n.message',
            'n.status',
            'n.action_type as actionType',
            'n.institution_id as institutionId',
            'n.resource_type as resourceType',
            'n.resource_id as resourceId',
            'n.resource_label as resourceLabel',
            'n.metadata',
            'n.created_at as createdAt',
            'n.read_at as readAt',
            'n.actor_user_id as actorId',
            sql<string | null>`nullif(trim(concat(actor_profile.first_name, ' ', actor_profile.last_name)), '')`.as(
                'actorName',
            ),
        ])
        .where('n.recipient_user_id', '=', recipientUserId);

    if (institutionId) {
        itemsQuery = itemsQuery.where('n.institution_id', '=', institutionId);
    }

    if (status) {
        itemsQuery = itemsQuery.where('n.status', '=', status);
    }

    const items = await itemsQuery
        .orderBy('n.created_at', 'desc')
        .limit(limit)
        .execute();

    let unreadCountQuery = dbClient
        .selectFrom('notifications as n')
        .select(sql<number>`cast(count(*) as integer)`.as('count'))
        .where('n.recipient_user_id', '=', recipientUserId)
        .where('n.status', '=', 'UNREAD');

    if (institutionId) {
        unreadCountQuery = unreadCountQuery.where('n.institution_id', '=', institutionId);
    }

    const unreadCount = await unreadCountQuery.executeTakeFirst();

    return {
        items,
        unreadCount: unreadCount?.count ?? 0,
    };
}
