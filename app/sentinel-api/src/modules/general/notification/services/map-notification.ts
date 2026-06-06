import type { NotificationActionType, NotificationResourceType } from '@sentinel/shared/schema';

type NotificationRow = {
    id: string;
    title: string;
    message: string;
    status: 'UNREAD' | 'READ' | null;
    actionType: NotificationActionType;
    institutionId: string | null;
    actorId: string | null;
    actorName: string | null;
    resourceType: NotificationResourceType;
    resourceId: string | null;
    resourceLabel: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date | string | null;
    readAt: Date | string | null;
};

export function mapNotification(record: NotificationRow) {
    return {
        id: record.id,
        title: record.title,
        message: record.message,
        status: record.status ?? 'UNREAD',
        actionType: record.actionType,
        institutionId: record.institutionId,
        actor: {
            id: record.actorId,
            name: record.actorName,
        },
        resource: {
            type: record.resourceType,
            id: record.resourceId,
            label: record.resourceLabel,
        },
        metadata: record.metadata ?? null,
        createdAt: new Date(record.createdAt ?? new Date()).toISOString(),
        readAt: record.readAt ? new Date(record.readAt).toISOString() : null,
    };
}
