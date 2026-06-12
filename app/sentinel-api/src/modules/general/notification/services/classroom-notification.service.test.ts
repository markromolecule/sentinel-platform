import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClassroomNotificationService } from './classroom-notification.service';
import { NotificationService } from '../notification.service';

vi.mock('../notification.service', () => ({
    NotificationService: {
        createNotification: vi.fn(),
    },
}));

describe('ClassroomNotificationService', () => {
    const dbClient = {} as any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('creates classroom instructor assigned notification with correct parameters', async () => {
        const mockNotif = { id: 'notif-1' } as any;
        vi.mocked(NotificationService.createNotification).mockResolvedValue(mockNotif);

        const result = await ClassroomNotificationService.notifyClassroomInstructorAssigned({
            dbClient,
            recipientUserId: 'recipient-1',
            actorUserId: 'actor-1',
            institutionId: 'institution-1',
            classGroupId: 'class-1',
            classroomLabel: 'Physics 101 - BSCS 3A',
            assignerName: 'Jordan Instructor',
        });

        expect(NotificationService.createNotification).toHaveBeenCalledWith({
            dbClient,
            recipientUserId: 'recipient-1',
            actorUserId: 'actor-1',
            institutionId: 'institution-1',
            title: 'New classroom assignment',
            message: 'Jordan Instructor added you to "Physics 101 - BSCS 3A".',
            actionType: 'CLASSROOM_INSTRUCTOR_ASSIGNED',
            resourceType: 'CLASSROOM_INSTRUCTOR_ASSIGNMENT',
            resourceId: 'class-1',
            resourceLabel: 'Physics 101 - BSCS 3A',
            metadata: {
                classGroupId: 'class-1',
            },
        });
        expect(result).toBe(mockNotif);
    });

    it('creates classroom assignment acknowledged notification with correct parameters', async () => {
        const mockNotif = { id: 'notif-2' } as any;
        vi.mocked(NotificationService.createNotification).mockResolvedValue(mockNotif);

        const result = await ClassroomNotificationService.notifyClassroomAssignmentAcknowledged({
            dbClient,
            recipientUserId: 'head-instructor-1',
            actorUserId: 'instructor-1',
            institutionId: 'inst-1',
            classGroupId: 'class-1',
            classroomLabel: 'Physics 101 - BSCS 3A',
            instructorName: 'Maria Santos',
        });

        expect(NotificationService.createNotification).toHaveBeenCalledWith({
            dbClient,
            recipientUserId: 'head-instructor-1',
            actorUserId: 'instructor-1',
            institutionId: 'inst-1',
            title: 'Assignment acknowledged',
            message: 'Maria Santos acknowledged the assignment for "Physics 101 - BSCS 3A".',
            actionType: 'CLASSROOM_INSTRUCTOR_ASSIGNMENT_ACKNOWLEDGED',
            resourceType: 'CLASSROOM_INSTRUCTOR_ASSIGNMENT',
            resourceId: 'class-1',
            resourceLabel: 'Physics 101 - BSCS 3A',
            metadata: { classGroupId: 'class-1' },
        });
        expect(result).toBe(mockNotif);
    });

    it('creates classroom assignment flagged notification with correct parameters', async () => {
        const mockNotif = { id: 'notif-3' } as any;
        vi.mocked(NotificationService.createNotification).mockResolvedValue(mockNotif);

        const result = await ClassroomNotificationService.notifyClassroomAssignmentFlagged({
            dbClient,
            recipientUserId: 'head-instructor-2',
            actorUserId: 'instructor-2',
            institutionId: 'inst-1',
            classGroupId: 'class-2',
            classroomLabel: 'Math 101',
            instructorName: 'Juan dela Cruz',
            flagReason: 'Schedule conflict with another classroom.',
        });

        expect(NotificationService.createNotification).toHaveBeenCalledWith({
            dbClient,
            recipientUserId: 'head-instructor-2',
            actorUserId: 'instructor-2',
            institutionId: 'inst-1',
            title: 'Assignment flagged',
            message:
                'Juan dela Cruz flagged the assignment for "Math 101": Schedule conflict with another classroom.',
            actionType: 'CLASSROOM_INSTRUCTOR_ASSIGNMENT_FLAGGED',
            resourceType: 'CLASSROOM_INSTRUCTOR_ASSIGNMENT',
            resourceId: 'class-2',
            resourceLabel: 'Math 101',
            metadata: {
                classGroupId: 'class-2',
                flagReason: 'Schedule conflict with another classroom.',
            },
        });
        expect(result).toBe(mockNotif);
    });
});
