import { type DbClient } from '@sentinel/db';
import { type AppNotificationType } from '@sentinel/shared/schema';
import { NotificationService } from '../notification.service';

/**
 * Service to handle question bank collection assignment notifications.
 */
export class QuestionBankCollectionNotificationService {
    /**
     * Notifies a user that they were added to a question bank collection.
     *
     * @param args - Arguments for creating the notification.
     * @returns The created notification object.
     */
    static async notifyQuestionBankCollectionAssigned(args: {
        dbClient: DbClient;
        recipientUserId: string;
        actorUserId: string;
        institutionId?: string | null;
        collectionId: string;
        collectionLabel: string;
        assignerName: string;
    }): Promise<AppNotificationType> {
        const {
            dbClient,
            recipientUserId,
            actorUserId,
            institutionId,
            collectionId,
            collectionLabel,
            assignerName,
        } = args;

        return await NotificationService.createNotification({
            dbClient,
            recipientUserId,
            actorUserId,
            institutionId,
            title: 'Question collection shared',
            message: `${assignerName} shared "${collectionLabel}" with you.`,
            actionType: 'QUESTION_BANK_COLLECTION_ASSIGNED',
            resourceType: 'QUESTION_BANK_COLLECTION',
            resourceId: collectionId,
            resourceLabel: collectionLabel,
            metadata: {
                collectionId,
            },
        });
    }
}
