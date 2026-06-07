import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExamNotificationService } from './exam-notification.service';
import { NotificationService } from '../notification.service';

vi.mock('../notification.service', () => ({
    NotificationService: {
        createNotification: vi.fn(),
    },
}));

describe('ExamNotificationService', () => {
    const dbClient = {} as any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('creates exam assignment created notification with correct parameters', async () => {
        const mockNotif = { id: 'notif-1' } as any;
        vi.mocked(NotificationService.createNotification).mockResolvedValue(mockNotif);

        const result = await ExamNotificationService.notifyExamAssignmentCreated({
            dbClient,
            recipientUserId: 'recipient-1',
            actorUserId: 'actor-1',
            institutionId: 'institution-1',
            examId: 'exam-1',
            examTitle: 'Midterm',
            assignerName: 'Jordan Instructor',
        });

        expect(NotificationService.createNotification).toHaveBeenCalledWith({
            dbClient,
            recipientUserId: 'recipient-1',
            actorUserId: 'actor-1',
            institutionId: 'institution-1',
            title: 'New exam assignment',
            message: 'Jordan Instructor assigned you to "Midterm".',
            actionType: 'EXAM_ASSIGNMENT_CREATED',
            resourceType: 'EXAM_ASSIGNMENT',
            resourceId: 'exam-1',
            resourceLabel: 'Midterm',
            metadata: {
                examId: 'exam-1',
            },
        });
        expect(result).toBe(mockNotif);
    });

    it('creates exam assignment accepted notification with correct parameters', async () => {
        const mockNotif = { id: 'notif-2' } as any;
        vi.mocked(NotificationService.createNotification).mockResolvedValue(mockNotif);

        const result = await ExamNotificationService.notifyExamAssignmentAccepted({
            dbClient,
            recipientUserId: 'recipient-1',
            actorUserId: 'actor-1',
            institutionId: 'institution-1',
            examId: 'exam-1',
            examTitle: 'Midterm',
            assigneeName: 'Alex Instructor',
        });

        expect(NotificationService.createNotification).toHaveBeenCalledWith({
            dbClient,
            recipientUserId: 'recipient-1',
            actorUserId: 'actor-1',
            institutionId: 'institution-1',
            title: 'Exam assignment accepted',
            message: 'Alex Instructor accepted the assignment for "Midterm".',
            actionType: 'EXAM_ASSIGNMENT_ACCEPTED',
            resourceType: 'EXAM_ASSIGNMENT',
            resourceId: 'exam-1',
            resourceLabel: 'Midterm',
            metadata: {
                examId: 'exam-1',
            },
        });
        expect(result).toBe(mockNotif);
    });

    it('creates exam assignment rejected notification with correct parameters', async () => {
        const mockNotif = { id: 'notif-3' } as any;
        vi.mocked(NotificationService.createNotification).mockResolvedValue(mockNotif);

        const result = await ExamNotificationService.notifyExamAssignmentRejected({
            dbClient,
            recipientUserId: 'recipient-1',
            actorUserId: 'actor-1',
            institutionId: 'institution-1',
            examId: 'exam-1',
            examTitle: 'Midterm',
            assigneeName: 'Alex Instructor',
        });

        expect(NotificationService.createNotification).toHaveBeenCalledWith({
            dbClient,
            recipientUserId: 'recipient-1',
            actorUserId: 'actor-1',
            institutionId: 'institution-1',
            title: 'Exam assignment declined',
            message: 'Alex Instructor declined the assignment for "Midterm".',
            actionType: 'EXAM_ASSIGNMENT_REJECTED',
            resourceType: 'EXAM_ASSIGNMENT',
            resourceId: 'exam-1',
            resourceLabel: 'Midterm',
            metadata: {
                examId: 'exam-1',
            },
        });
        expect(result).toBe(mockNotif);
    });
});
