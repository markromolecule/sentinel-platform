import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QuestionBankCollectionNotificationService } from './question-bank-collection-notification.service';
import { NotificationService } from '../notification.service';

vi.mock('../notification.service', () => ({
    NotificationService: {
        createNotification: vi.fn(),
    },
}));

describe('QuestionBankCollectionNotificationService', () => {
    const dbClient = {} as any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('creates collection assignment notifications with the expected contract', async () => {
        const mockNotif = { id: 'notif-1' } as any;
        vi.mocked(NotificationService.createNotification).mockResolvedValue(mockNotif);

        const result = await QuestionBankCollectionNotificationService.notifyQuestionBankCollectionAssigned(
            {
                dbClient,
                recipientUserId: 'recipient-1',
                actorUserId: 'actor-1',
                institutionId: 'institution-1',
                collectionId: 'collection-1',
                collectionLabel: 'Physics Practice Set',
                assignerName: 'Jordan Instructor',
            },
        );

        expect(NotificationService.createNotification).toHaveBeenCalledWith({
            dbClient,
            recipientUserId: 'recipient-1',
            actorUserId: 'actor-1',
            institutionId: 'institution-1',
            title: 'Question collection shared',
            message: 'Jordan Instructor shared "Physics Practice Set" with you.',
            actionType: 'QUESTION_BANK_COLLECTION_ASSIGNED',
            resourceType: 'QUESTION_BANK_COLLECTION',
            resourceId: 'collection-1',
            resourceLabel: 'Physics Practice Set',
            metadata: {
                collectionId: 'collection-1',
            },
        });
        expect(result).toBe(mockNotif);
    });
});
