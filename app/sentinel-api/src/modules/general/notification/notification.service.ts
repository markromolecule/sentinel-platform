import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import type {
    AppNotificationType,
    NotificationActionType,
    NotificationListType,
    NotificationResourceType,
    NotificationStatusType,
} from '@sentinel/shared/schema';
import { createNotificationData } from './data/create-notification';
import { getNotificationsData } from './data/get-notifications';
import { markNotificationReadData } from './data/mark-notification-read';
import { getNotificationTableSupport } from './helper/notification-schema-compat';
import { mapNotification } from './services/map-notification';

export type CreateNotificationArgs = {
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

export class NotificationService {
    static async createNotification(args: CreateNotificationArgs): Promise<AppNotificationType> {
        const notificationTableSupport = await getNotificationTableSupport(args.dbClient);

        if (!notificationTableSupport.hasNotificationsTable) {
            return {
                id: '00000000-0000-0000-0000-000000000000',
                title: args.title,
                message: args.message,
                status: 'UNREAD',
                actionType: args.actionType,
                institutionId: args.institutionId ?? null,
                actor: {
                    id: args.actorUserId ?? null,
                    name: null,
                },
                resource: {
                    type: args.resourceType,
                    id: args.resourceId ?? null,
                    label: args.resourceLabel ?? null,
                },
                metadata: args.metadata ?? null,
                createdAt: new Date().toISOString(),
                readAt: null,
            };
        }

        const record = await createNotificationData(args);
        return mapNotification({
            id: record.notification_id,
            title: record.title,
            message: record.message,
            status: record.status,
            actionType: record.action_type,
            institutionId: record.institution_id,
            actorId: record.actor_user_id,
            actorName: null,
            resourceType: record.resource_type,
            resourceId: record.resource_id,
            resourceLabel: record.resource_label,
            metadata: (record.metadata as Record<string, unknown> | null) ?? null,
            createdAt: record.created_at,
            readAt: record.read_at,
        });
    }

    static async listNotifications(args: {
        dbClient: DbClient;
        recipientUserId: string;
        institutionId?: string;
        status?: NotificationStatusType;
        limit?: number;
    }): Promise<NotificationListType> {
        const notificationTableSupport = await getNotificationTableSupport(args.dbClient);

        if (!notificationTableSupport.hasNotificationsTable) {
            return {
                items: [],
                unreadCount: 0,
            };
        }

        const result = await getNotificationsData(args);

        return {
            items: result.items.map((item) =>
                mapNotification({
                    ...item,
                    metadata: (item.metadata as Record<string, unknown> | null) ?? null,
                }),
            ),
            unreadCount: result.unreadCount,
        };
    }

    static async markNotificationRead(args: {
        dbClient: DbClient;
        notificationId: string;
        recipientUserId: string;
    }): Promise<AppNotificationType> {
        const notificationTableSupport = await getNotificationTableSupport(args.dbClient);

        if (!notificationTableSupport.hasNotificationsTable) {
            throw new HTTPException(404, {
                message: 'Notification not found.',
            });
        }

        const record = await markNotificationReadData(args);

        if (!record) {
            throw new HTTPException(404, {
                message: 'Notification not found.',
            });
        }

        return mapNotification({
            id: record.notification_id,
            title: record.title,
            message: record.message,
            status: record.status,
            actionType: record.action_type,
            institutionId: record.institution_id,
            actorId: record.actor_user_id,
            actorName: null,
            resourceType: record.resource_type,
            resourceId: record.resource_id,
            resourceLabel: record.resource_label,
            metadata: (record.metadata as Record<string, unknown> | null) ?? null,
            createdAt: record.created_at,
            readAt: record.read_at,
        });
    }

    static async notifyExamAssignmentCreated(args: {
        dbClient: DbClient;
        recipientUserId: string;
        actorUserId: string;
        institutionId?: string | null;
        examId: string;
        examTitle: string;
        assignerName: string;
    }) {
        const {
            dbClient,
            recipientUserId,
            actorUserId,
            institutionId,
            examId,
            examTitle,
            assignerName,
        } = args;

        return await NotificationService.createNotification({
            dbClient,
            recipientUserId,
            actorUserId,
            institutionId,
            title: 'New exam assignment',
            message: `${assignerName} assigned you to "${examTitle}".`,
            actionType: 'EXAM_ASSIGNMENT_CREATED',
            resourceType: 'EXAM_ASSIGNMENT',
            resourceId: examId,
            resourceLabel: examTitle,
            metadata: {
                examId,
            },
        });
    }

    static async notifyExamAssignmentAccepted(args: {
        dbClient: DbClient;
        recipientUserId: string;
        actorUserId: string;
        institutionId?: string | null;
        examId: string;
        examTitle: string;
        assigneeName: string;
    }) {
        const {
            dbClient,
            recipientUserId,
            actorUserId,
            institutionId,
            examId,
            examTitle,
            assigneeName,
        } = args;

        return await NotificationService.createNotification({
            dbClient,
            recipientUserId,
            actorUserId,
            institutionId,
            title: 'Exam assignment accepted',
            message: `${assigneeName} accepted the assignment for "${examTitle}".`,
            actionType: 'EXAM_ASSIGNMENT_ACCEPTED',
            resourceType: 'EXAM_ASSIGNMENT',
            resourceId: examId,
            resourceLabel: examTitle,
            metadata: {
                examId,
            },
        });
    }

    static async notifyExamAssignmentRejected(args: {
        dbClient: DbClient;
        recipientUserId: string;
        actorUserId: string;
        institutionId?: string | null;
        examId: string;
        examTitle: string;
        assigneeName: string;
    }) {
        const {
            dbClient,
            recipientUserId,
            actorUserId,
            institutionId,
            examId,
            examTitle,
            assigneeName,
        } = args;

        return await NotificationService.createNotification({
            dbClient,
            recipientUserId,
            actorUserId,
            institutionId,
            title: 'Exam assignment declined',
            message: `${assigneeName} declined the assignment for "${examTitle}".`,
            actionType: 'EXAM_ASSIGNMENT_REJECTED',
            resourceType: 'EXAM_ASSIGNMENT',
            resourceId: examId,
            resourceLabel: examTitle,
            metadata: {
                examId,
            },
        });
    }

    static async notifyClassroomInstructorAssigned(args: {
        dbClient: DbClient;
        recipientUserId: string;
        actorUserId: string;
        institutionId?: string | null;
        classGroupId: string;
        classroomLabel: string;
        assignerName: string;
    }) {
        const {
            dbClient,
            recipientUserId,
            actorUserId,
            institutionId,
            classGroupId,
            classroomLabel,
            assignerName,
        } = args;

        return await NotificationService.createNotification({
            dbClient,
            recipientUserId,
            actorUserId,
            institutionId,
            title: 'New classroom assignment',
            message: `${assignerName} added you to "${classroomLabel}".`,
            actionType: 'CLASSROOM_INSTRUCTOR_ASSIGNED',
            resourceType: 'CLASSROOM_INSTRUCTOR_ASSIGNMENT',
            resourceId: classGroupId,
            resourceLabel: classroomLabel,
            metadata: {
                classGroupId,
            },
        });
    }
}
