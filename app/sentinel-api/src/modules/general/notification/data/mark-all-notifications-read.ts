import { type DbClient } from '@sentinel/db';

export async function markAllNotificationsReadData(args: {
    dbClient: DbClient;
    recipientUserId: string;
}): Promise<number> {
    const { dbClient, recipientUserId } = args;

    const result = await dbClient
        .updateTable('notifications')
        .set({ status: 'READ', read_at: new Date().toISOString() })
        .where('recipient_user_id', '=', recipientUserId)
        .where('status', '=', 'UNREAD')
        .executeTakeFirst();

    return Number(result.numUpdatedRows);
}
