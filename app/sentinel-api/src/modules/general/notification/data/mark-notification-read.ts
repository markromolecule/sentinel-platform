import { type DbClient } from '@sentinel/db';

export type MarkNotificationReadDataArgs = {
    dbClient: DbClient;
    notificationId: string;
    recipientUserId: string;
};

export async function markNotificationReadData(args: MarkNotificationReadDataArgs) {
    const { dbClient, notificationId, recipientUserId } = args;

    return await dbClient
        .updateTable('notifications')
        .set({
            status: 'READ',
            read_at: new Date(),
            updated_at: new Date(),
        })
        .where('notification_id', '=', notificationId)
        .where('recipient_user_id', '=', recipientUserId)
        .returningAll()
        .executeTakeFirst();
}
