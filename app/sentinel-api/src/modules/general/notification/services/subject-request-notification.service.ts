import { type DbClient } from '@sentinel/db';
import { type AppNotificationType } from '@sentinel/shared/schema';
import { NotificationService } from '../notification.service';

/**
 * Service to handle instructor subject qualification request notifications.
 */
export class SubjectRequestNotificationService {
    /**
     * Notifies admins/reviewers that an instructor submitted a subject qualification request.
     * 
     * @param args - Arguments for creating the notification.
     * @returns The created notification object.
     */
    static async notifyInstructorSubjectRequestSubmitted(args: {
        dbClient: DbClient;
        recipientUserId: string;
        actorUserId: string;
        institutionId?: string | null;
        requestId: string;
        subjectTitle: string;
        instructorName: string;
    }): Promise<AppNotificationType> {
        const {
            dbClient,
            recipientUserId,
            actorUserId,
            institutionId,
            requestId,
            subjectTitle,
            instructorName,
        } = args;

        return await NotificationService.createNotification({
            dbClient,
            recipientUserId,
            actorUserId,
            institutionId,
            title: 'New subject request',
            message: `${instructorName} requested qualification for "${subjectTitle}".`,
            actionType: 'INSTRUCTOR_SUBJECT_REQUEST_SUBMITTED',
            resourceType: 'INSTRUCTOR_SUBJECT_REQUEST',
            resourceId: requestId,
            resourceLabel: subjectTitle,
            metadata: { requestId },
        });
    }

    /**
     * Notifies the instructor that their subject qualification request was approved.
     * 
     * @param args - Arguments for creating the notification.
     * @returns The created notification object.
     */
    static async notifyInstructorSubjectRequestApproved(args: {
        dbClient: DbClient;
        recipientUserId: string;
        actorUserId: string;
        institutionId?: string | null;
        requestId: string;
        subjectTitle: string;
        reviewerName: string;
    }): Promise<AppNotificationType> {
        const {
            dbClient,
            recipientUserId,
            actorUserId,
            institutionId,
            requestId,
            subjectTitle,
            reviewerName,
        } = args;

        return await NotificationService.createNotification({
            dbClient,
            recipientUserId,
            actorUserId,
            institutionId,
            title: 'Subject request approved',
            message: `${reviewerName} approved your qualification request for "${subjectTitle}".`,
            actionType: 'INSTRUCTOR_SUBJECT_REQUEST_APPROVED',
            resourceType: 'INSTRUCTOR_SUBJECT_REQUEST',
            resourceId: requestId,
            resourceLabel: subjectTitle,
            metadata: { requestId },
        });
    }

    /**
     * Notifies the instructor that their subject qualification request was rejected.
     * 
     * @param args - Arguments for creating the notification.
     * @returns The created notification object.
     */
    static async notifyInstructorSubjectRequestRejected(args: {
        dbClient: DbClient;
        recipientUserId: string;
        actorUserId: string;
        institutionId?: string | null;
        requestId: string;
        subjectTitle: string;
        reviewerName: string;
        reviewComments?: string | null;
    }): Promise<AppNotificationType> {
        const {
            dbClient,
            recipientUserId,
            actorUserId,
            institutionId,
            requestId,
            subjectTitle,
            reviewerName,
            reviewComments,
        } = args;

        return await NotificationService.createNotification({
            dbClient,
            recipientUserId,
            actorUserId,
            institutionId,
            title: 'Subject request rejected',
            message: reviewComments
                ? `${reviewerName} rejected your qualification request for "${subjectTitle}": ${reviewComments}`
                : `${reviewerName} rejected your qualification request for "${subjectTitle}".`,
            actionType: 'INSTRUCTOR_SUBJECT_REQUEST_REJECTED',
            resourceType: 'INSTRUCTOR_SUBJECT_REQUEST',
            resourceId: requestId,
            resourceLabel: subjectTitle,
            metadata: { requestId, reviewComments: reviewComments ?? null },
        });
    }
}
