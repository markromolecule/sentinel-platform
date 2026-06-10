import { type DbClient } from '@sentinel/db';

export type DeleteNotificationsDataArgs = {
    dbClient: DbClient;
    recipientUserId: string;
    notificationIds: string[];
};

/**
 * Delete notifications that belong to the authenticated recipient.
 */
export async function deleteNotificationsData(args: DeleteNotificationsDataArgs) {
    const { dbClient, recipientUserId, notificationIds } = args;

    if (notificationIds.length === 0) {
        return {
            deleted_count: 0,
        };
    }

    const deletedRecords = await dbClient
        .deleteFrom('notifications')
        .where('recipient_user_id', '=', recipientUserId)
        .where('notification_id', 'in', notificationIds)
        .returning('notification_id')
        .execute();

    return {
        deleted_count: deletedRecords.length,
    };
}
