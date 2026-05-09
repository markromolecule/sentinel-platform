import { type DbClient } from '@sentinel/db';
import type { NotificationActionType, NotificationResourceType } from '@sentinel/shared/schema';

export type CreateNotificationDataArgs = {
    dbClient: DbClient;
    recipientUserId: string;
    actorUserId?: string | null;
    institutionId?: string | null;
    title: string;
    message: string;
    actionType: NotificationActionType;
    resourceType: NotificationResourceType;
    resourceId?: string | null;
    resourceLabel?: string | null;
    metadata?: Record<string, unknown> | null;
};

export async function createNotificationData(args: CreateNotificationDataArgs) {
    const {
        dbClient,
        recipientUserId,
        actorUserId,
        institutionId,
        title,
        message,
        actionType,
        resourceType,
        resourceId,
        resourceLabel,
        metadata,
    } = args;

    return await dbClient
        .insertInto('notifications')
        .values({
            recipient_user_id: recipientUserId,
            actor_user_id: actorUserId ?? null,
            institution_id: institutionId ?? null,
            title,
            message,
            action_type: actionType,
            resource_type: resourceType,
            resource_id: resourceId ?? null,
            resource_label: resourceLabel ?? null,
            metadata: metadata ?? null,
            updated_at: new Date(),
        })
        .returningAll()
        .executeTakeFirstOrThrow();
}
