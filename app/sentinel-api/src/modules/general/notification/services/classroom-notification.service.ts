import { type DbClient } from '@sentinel/db';
import { type AppNotificationType } from '@sentinel/shared/schema';
import { NotificationService } from '../notification.service';

/**
 * Service to handle classroom-related notifications.
 */
export class ClassroomNotificationService {
    /**
     * Notifies the instructor that they have been assigned to a classroom.
     *
     * @param args - Arguments for creating the notification.
     * @returns The created notification object.
     */
    static async notifyClassroomInstructorAssigned(args: {
        dbClient: DbClient;
        recipientUserId: string;
        actorUserId: string;
        institutionId?: string | null;
        classGroupId: string;
        classroomLabel: string;
        assignerName: string;
    }): Promise<AppNotificationType> {
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

    /**
     * Notifies the head instructor / admin that an instructor acknowledged their classroom assignment.
     *
     * @param args - Arguments for creating the notification.
     * @returns The created notification object.
     */
    static async notifyClassroomAssignmentAcknowledged(args: {
        dbClient: DbClient;
        recipientUserId: string;
        actorUserId: string;
        institutionId?: string | null;
        classGroupId: string;
        classroomLabel: string;
        instructorName: string;
    }): Promise<AppNotificationType> {
        const {
            dbClient,
            recipientUserId,
            actorUserId,
            institutionId,
            classGroupId,
            classroomLabel,
            instructorName,
        } = args;

        return await NotificationService.createNotification({
            dbClient,
            recipientUserId,
            actorUserId,
            institutionId,
            title: 'Assignment acknowledged',
            message: `${instructorName} acknowledged the assignment for "${classroomLabel}".`,
            actionType: 'CLASSROOM_INSTRUCTOR_ASSIGNMENT_ACKNOWLEDGED',
            resourceType: 'CLASSROOM_INSTRUCTOR_ASSIGNMENT',
            resourceId: classGroupId,
            resourceLabel: classroomLabel,
            metadata: { classGroupId },
        });
    }

    /**
     * Notifies the head instructor / admin that an instructor flagged their classroom assignment.
     *
     * @param args - Arguments for creating the notification.
     * @returns The created notification object.
     */
    static async notifyClassroomAssignmentFlagged(args: {
        dbClient: DbClient;
        recipientUserId: string;
        actorUserId: string;
        institutionId?: string | null;
        classGroupId: string;
        classroomLabel: string;
        instructorName: string;
        flagReason: string;
    }): Promise<AppNotificationType> {
        const {
            dbClient,
            recipientUserId,
            actorUserId,
            institutionId,
            classGroupId,
            classroomLabel,
            instructorName,
            flagReason,
        } = args;

        return await NotificationService.createNotification({
            dbClient,
            recipientUserId,
            actorUserId,
            institutionId,
            title: 'Assignment flagged',
            message: `${instructorName} flagged the assignment for "${classroomLabel}": ${flagReason}`,
            actionType: 'CLASSROOM_INSTRUCTOR_ASSIGNMENT_FLAGGED',
            resourceType: 'CLASSROOM_INSTRUCTOR_ASSIGNMENT',
            resourceId: classGroupId,
            resourceLabel: classroomLabel,
            metadata: { classGroupId, flagReason },
        });
    }
}
