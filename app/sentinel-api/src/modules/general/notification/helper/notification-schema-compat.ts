import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

type NotificationTableSupport = {
    hasNotificationsTable: boolean;
};

const notificationTableSupportCache = new WeakMap<object, Promise<NotificationTableSupport>>();

export function getNotificationTableSupport(dbClient: DbClient) {
    const cacheKey = dbClient as object;
    const cached = notificationTableSupportCache.get(cacheKey);

    if (cached) {
        return cached;
    }

    const pendingCheck = sql<{ table_name: string }>`
        select table_name
        from information_schema.tables
        where table_schema = 'public'
          and table_name = 'notifications'
    `
        .execute(dbClient)
        .then((result) => ({
            hasNotificationsTable: result.rows.some((row) => row.table_name === 'notifications'),
        }))
        .catch(() => ({
            hasNotificationsTable: false,
        }));

    notificationTableSupportCache.set(cacheKey, pendingCheck);
    return pendingCheck;
}
