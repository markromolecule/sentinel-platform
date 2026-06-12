import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SubjectRequestNotificationService } from './subject-request-notification.service';
import { NotificationService } from '../notification.service';

vi.mock('../notification.service', () => ({
    NotificationService: {
        createNotification: vi.fn(),
    },
}));

describe('SubjectRequestNotificationService', () => {
    const dbClient = {} as any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('creates subject request submission notification with correct parameters', async () => {
        const mockNotif = { id: 'notif-1' } as any;
        vi.mocked(NotificationService.createNotification).mockResolvedValue(mockNotif);

        const result =
            await SubjectRequestNotificationService.notifyInstructorSubjectRequestSubmitted({
                dbClient,
                recipientUserId: 'admin-1',
                actorUserId: 'instructor-3',
                institutionId: 'inst-1',
                requestId: 'req-1',
                subjectTitle: 'Advanced Calculus',
                instructorName: 'Ana Reyes',
            });

        expect(NotificationService.createNotification).toHaveBeenCalledWith({
            dbClient,
            recipientUserId: 'admin-1',
            actorUserId: 'instructor-3',
            institutionId: 'inst-1',
            title: 'New subject request',
            message: 'Ana Reyes requested qualification for "Advanced Calculus".',
            actionType: 'INSTRUCTOR_SUBJECT_REQUEST_SUBMITTED',
            resourceType: 'INSTRUCTOR_SUBJECT_REQUEST',
            resourceId: 'req-1',
            resourceLabel: 'Advanced Calculus',
            metadata: { requestId: 'req-1' },
        });
        expect(result).toBe(mockNotif);
    });

    it('creates subject request approval notification with correct parameters', async () => {
        const mockNotif = { id: 'notif-2' } as any;
        vi.mocked(NotificationService.createNotification).mockResolvedValue(mockNotif);

        const result =
            await SubjectRequestNotificationService.notifyInstructorSubjectRequestApproved({
                dbClient,
                recipientUserId: 'instructor-4',
                actorUserId: 'reviewer-1',
                institutionId: 'inst-1',
                requestId: 'req-2',
                subjectTitle: 'Advanced Calculus',
                reviewerName: 'Dr. Rivera',
            });

        expect(NotificationService.createNotification).toHaveBeenCalledWith({
            dbClient,
            recipientUserId: 'instructor-4',
            actorUserId: 'reviewer-1',
            institutionId: 'inst-1',
            title: 'Subject request approved',
            message: 'Dr. Rivera approved your qualification request for "Advanced Calculus".',
            actionType: 'INSTRUCTOR_SUBJECT_REQUEST_APPROVED',
            resourceType: 'INSTRUCTOR_SUBJECT_REQUEST',
            resourceId: 'req-2',
            resourceLabel: 'Advanced Calculus',
            metadata: { requestId: 'req-2' },
        });
        expect(result).toBe(mockNotif);
    });

    it('creates subject request rejection notification with comments', async () => {
        const mockNotif = { id: 'notif-3' } as any;
        vi.mocked(NotificationService.createNotification).mockResolvedValue(mockNotif);

        const result =
            await SubjectRequestNotificationService.notifyInstructorSubjectRequestRejected({
                dbClient,
                recipientUserId: 'instructor-5',
                actorUserId: 'reviewer-1',
                institutionId: 'inst-1',
                requestId: 'req-3',
                subjectTitle: 'Chemistry 101',
                reviewerName: 'Dr. Rivera',
                reviewComments: 'Insufficient credentials.',
            });

        expect(NotificationService.createNotification).toHaveBeenCalledWith({
            dbClient,
            recipientUserId: 'instructor-5',
            actorUserId: 'reviewer-1',
            institutionId: 'inst-1',
            title: 'Subject request rejected',
            message:
                'Dr. Rivera rejected your qualification request for "Chemistry 101": Insufficient credentials.',
            actionType: 'INSTRUCTOR_SUBJECT_REQUEST_REJECTED',
            resourceType: 'INSTRUCTOR_SUBJECT_REQUEST',
            resourceId: 'req-3',
            resourceLabel: 'Chemistry 101',
            metadata: { requestId: 'req-3', reviewComments: 'Insufficient credentials.' },
        });
        expect(result).toBe(mockNotif);
    });

    it('creates subject request rejection notification without comments when omitted', async () => {
        const mockNotif = { id: 'notif-4' } as any;
        vi.mocked(NotificationService.createNotification).mockResolvedValue(mockNotif);

        const result =
            await SubjectRequestNotificationService.notifyInstructorSubjectRequestRejected({
                dbClient,
                recipientUserId: 'instructor-6',
                actorUserId: 'reviewer-1',
                institutionId: 'inst-1',
                requestId: 'req-4',
                subjectTitle: 'Chemistry 101',
                reviewerName: 'Dr. Rivera',
            });

        expect(NotificationService.createNotification).toHaveBeenCalledWith({
            dbClient,
            recipientUserId: 'instructor-6',
            actorUserId: 'reviewer-1',
            institutionId: 'inst-1',
            title: 'Subject request rejected',
            message: 'Dr. Rivera rejected your qualification request for "Chemistry 101".',
            actionType: 'INSTRUCTOR_SUBJECT_REQUEST_REJECTED',
            resourceType: 'INSTRUCTOR_SUBJECT_REQUEST',
            resourceId: 'req-4',
            resourceLabel: 'Chemistry 101',
            metadata: { requestId: 'req-4', reviewComments: null },
        });
        expect(result).toBe(mockNotif);
    });
});
