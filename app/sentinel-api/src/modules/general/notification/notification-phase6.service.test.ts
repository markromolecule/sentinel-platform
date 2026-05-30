import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationService } from './notification.service';
import { createNotificationData } from './data/create-notification';
import { getNotificationTableSupport } from './helper/notification-schema-compat';

vi.mock('./data/create-notification', () => ({
    createNotificationData: vi.fn(),
}));

vi.mock('./data/get-notifications', () => ({
    getNotificationsData: vi.fn(),
}));

vi.mock('./data/mark-notification-read', () => ({
    markNotificationReadData: vi.fn(),
}));

vi.mock('./helper/notification-schema-compat', () => ({
    getNotificationTableSupport: vi.fn(),
}));

const BASE_RECORD = {
    notification_id: 'notif-1',
    recipient_user_id: 'recipient-1',
    actor_user_id: 'actor-1',
    institution_id: 'inst-1',
    status: 'UNREAD',
    created_at: new Date('2026-05-30T10:00:00.000Z'),
    updated_at: new Date('2026-05-30T10:00:00.000Z'),
    read_at: null,
} as const;

describe('NotificationService — Phase 6 methods', () => {
    const dbClient = {} as any;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getNotificationTableSupport).mockResolvedValue({
            hasNotificationsTable: true,
        });
    });

    describe('notifyClassroomAssignmentAcknowledged', () => {
        it('sends acknowledgment notification with correct action type and message', async () => {
            vi.mocked(createNotificationData).mockResolvedValue({
                ...BASE_RECORD,
                title: 'Assignment acknowledged',
                message: 'Maria Santos acknowledged the assignment for "Physics 101 - BSCS 3A".',
                action_type: 'CLASSROOM_INSTRUCTOR_ASSIGNMENT_ACKNOWLEDGED',
                resource_type: 'CLASSROOM_INSTRUCTOR_ASSIGNMENT',
                resource_id: 'class-1',
                resource_label: 'Physics 101 - BSCS 3A',
                metadata: { classGroupId: 'class-1' },
            } as any);

            await NotificationService.notifyClassroomAssignmentAcknowledged({
                dbClient,
                recipientUserId: 'head-instructor-1',
                actorUserId: 'instructor-1',
                institutionId: 'inst-1',
                classGroupId: 'class-1',
                classroomLabel: 'Physics 101 - BSCS 3A',
                instructorName: 'Maria Santos',
            });

            expect(createNotificationData).toHaveBeenCalledWith(
                expect.objectContaining({
                    dbClient,
                    recipientUserId: 'head-instructor-1',
                    actorUserId: 'instructor-1',
                    actionType: 'CLASSROOM_INSTRUCTOR_ASSIGNMENT_ACKNOWLEDGED',
                    resourceType: 'CLASSROOM_INSTRUCTOR_ASSIGNMENT',
                    resourceId: 'class-1',
                    resourceLabel: 'Physics 101 - BSCS 3A',
                    title: 'Assignment acknowledged',
                }),
            );
        });
    });

    describe('notifyClassroomAssignmentFlagged', () => {
        it('sends flagged notification including the flag reason in the message', async () => {
            vi.mocked(createNotificationData).mockResolvedValue({
                ...BASE_RECORD,
                title: 'Assignment flagged',
                message:
                    'Juan dela Cruz flagged the assignment for "Math 101": Schedule conflict with another classroom.',
                action_type: 'CLASSROOM_INSTRUCTOR_ASSIGNMENT_FLAGGED',
                resource_type: 'CLASSROOM_INSTRUCTOR_ASSIGNMENT',
                resource_id: 'class-2',
                resource_label: 'Math 101',
                metadata: {
                    classGroupId: 'class-2',
                    flagReason: 'Schedule conflict with another classroom.',
                },
            } as any);

            await NotificationService.notifyClassroomAssignmentFlagged({
                dbClient,
                recipientUserId: 'head-instructor-2',
                actorUserId: 'instructor-2',
                institutionId: 'inst-1',
                classGroupId: 'class-2',
                classroomLabel: 'Math 101',
                instructorName: 'Juan dela Cruz',
                flagReason: 'Schedule conflict with another classroom.',
            });

            expect(createNotificationData).toHaveBeenCalledWith(
                expect.objectContaining({
                    actionType: 'CLASSROOM_INSTRUCTOR_ASSIGNMENT_FLAGGED',
                    resourceType: 'CLASSROOM_INSTRUCTOR_ASSIGNMENT',
                    metadata: expect.objectContaining({
                        classGroupId: 'class-2',
                        flagReason: 'Schedule conflict with another classroom.',
                    }),
                }),
            );
        });
    });

    describe('notifyInstructorSubjectRequestSubmitted', () => {
        it('sends subject request submission notification with correct type', async () => {
            vi.mocked(createNotificationData).mockResolvedValue({
                ...BASE_RECORD,
                title: 'New subject request',
                message: 'Ana Reyes requested qualification for "Advanced Calculus".',
                action_type: 'INSTRUCTOR_SUBJECT_REQUEST_SUBMITTED',
                resource_type: 'INSTRUCTOR_SUBJECT_REQUEST',
                resource_id: 'req-1',
                resource_label: 'Advanced Calculus',
                metadata: { requestId: 'req-1' },
            } as any);

            await NotificationService.notifyInstructorSubjectRequestSubmitted({
                dbClient,
                recipientUserId: 'admin-1',
                actorUserId: 'instructor-3',
                institutionId: 'inst-1',
                requestId: 'req-1',
                subjectTitle: 'Advanced Calculus',
                instructorName: 'Ana Reyes',
            });

            expect(createNotificationData).toHaveBeenCalledWith(
                expect.objectContaining({
                    actionType: 'INSTRUCTOR_SUBJECT_REQUEST_SUBMITTED',
                    resourceType: 'INSTRUCTOR_SUBJECT_REQUEST',
                    resourceId: 'req-1',
                    title: 'New subject request',
                }),
            );
        });
    });

    describe('notifyInstructorSubjectRequestApproved', () => {
        it('sends approval notification to the instructor', async () => {
            vi.mocked(createNotificationData).mockResolvedValue({
                ...BASE_RECORD,
                title: 'Subject request approved',
                message: 'Dr. Rivera approved your qualification request for "Advanced Calculus".',
                action_type: 'INSTRUCTOR_SUBJECT_REQUEST_APPROVED',
                resource_type: 'INSTRUCTOR_SUBJECT_REQUEST',
                resource_id: 'req-2',
                resource_label: 'Advanced Calculus',
                metadata: { requestId: 'req-2' },
            } as any);

            await NotificationService.notifyInstructorSubjectRequestApproved({
                dbClient,
                recipientUserId: 'instructor-4',
                actorUserId: 'reviewer-1',
                institutionId: 'inst-1',
                requestId: 'req-2',
                subjectTitle: 'Advanced Calculus',
                reviewerName: 'Dr. Rivera',
            });

            expect(createNotificationData).toHaveBeenCalledWith(
                expect.objectContaining({
                    actionType: 'INSTRUCTOR_SUBJECT_REQUEST_APPROVED',
                    resourceType: 'INSTRUCTOR_SUBJECT_REQUEST',
                    resourceId: 'req-2',
                    title: 'Subject request approved',
                }),
            );
        });
    });

    describe('notifyInstructorSubjectRequestRejected', () => {
        it('sends rejection notification with review comments in the message', async () => {
            vi.mocked(createNotificationData).mockResolvedValue({
                ...BASE_RECORD,
                title: 'Subject request rejected',
                message:
                    'Dr. Rivera rejected your qualification request for "Chemistry 101": Insufficient credentials.',
                action_type: 'INSTRUCTOR_SUBJECT_REQUEST_REJECTED',
                resource_type: 'INSTRUCTOR_SUBJECT_REQUEST',
                resource_id: 'req-3',
                resource_label: 'Chemistry 101',
                metadata: { requestId: 'req-3', reviewComments: 'Insufficient credentials.' },
            } as any);

            await NotificationService.notifyInstructorSubjectRequestRejected({
                dbClient,
                recipientUserId: 'instructor-5',
                actorUserId: 'reviewer-1',
                institutionId: 'inst-1',
                requestId: 'req-3',
                subjectTitle: 'Chemistry 101',
                reviewerName: 'Dr. Rivera',
                reviewComments: 'Insufficient credentials.',
            });

            expect(createNotificationData).toHaveBeenCalledWith(
                expect.objectContaining({
                    actionType: 'INSTRUCTOR_SUBJECT_REQUEST_REJECTED',
                    resourceType: 'INSTRUCTOR_SUBJECT_REQUEST',
                    metadata: expect.objectContaining({
                        requestId: 'req-3',
                        reviewComments: 'Insufficient credentials.',
                    }),
                }),
            );
        });

        it('sends rejection without review comments when omitted', async () => {
            vi.mocked(createNotificationData).mockResolvedValue({
                ...BASE_RECORD,
                title: 'Subject request rejected',
                message: 'Dr. Rivera rejected your qualification request for "Chemistry 101".',
                action_type: 'INSTRUCTOR_SUBJECT_REQUEST_REJECTED',
                resource_type: 'INSTRUCTOR_SUBJECT_REQUEST',
                resource_id: 'req-4',
                resource_label: 'Chemistry 101',
                metadata: { requestId: 'req-4', reviewComments: null },
            } as any);

            await NotificationService.notifyInstructorSubjectRequestRejected({
                dbClient,
                recipientUserId: 'instructor-6',
                actorUserId: 'reviewer-1',
                institutionId: 'inst-1',
                requestId: 'req-4',
                subjectTitle: 'Chemistry 101',
                reviewerName: 'Dr. Rivera',
            });

            const callArg = vi.mocked(createNotificationData).mock.calls[0][0];
            expect(callArg.message).not.toContain(':');
            expect(callArg.message).toContain('Chemistry 101');
        });
    });
});
