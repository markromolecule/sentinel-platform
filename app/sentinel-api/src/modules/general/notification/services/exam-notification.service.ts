import { type DbClient } from '@sentinel/db';
import { type AppNotificationType } from '@sentinel/shared/schema';
import { NotificationService } from '../notification.service';

/**
 * Service to handle exam-related notifications.
 */
export class ExamNotificationService {
    /**
     * Notifies the assignee that a new exam assignment has been created.
     *
     * @param args - Arguments for creating the notification.
     * @returns The created notification object.
     */
    static async notifyExamAssignmentCreated(args: {
        dbClient: DbClient;
        recipientUserId: string;
        actorUserId: string;
        institutionId?: string | null;
        examId: string;
        examTitle: string;
        assignerName: string;
    }): Promise<AppNotificationType> {
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

    /**
     * Notifies the assigner that the exam assignment has been accepted.
     *
     * @param args - Arguments for creating the notification.
     * @returns The created notification object.
     */
    static async notifyExamAssignmentAccepted(args: {
        dbClient: DbClient;
        recipientUserId: string;
        actorUserId: string;
        institutionId?: string | null;
        examId: string;
        examTitle: string;
        assigneeName: string;
    }): Promise<AppNotificationType> {
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

    /**
     * Notifies the assigner that the exam assignment has been rejected (declined).
     *
     * @param args - Arguments for creating the notification.
     * @returns The created notification object.
     */
    static async notifyExamAssignmentRejected(args: {
        dbClient: DbClient;
        recipientUserId: string;
        actorUserId: string;
        institutionId?: string | null;
        examId: string;
        examTitle: string;
        assigneeName: string;
    }): Promise<AppNotificationType> {
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
}
