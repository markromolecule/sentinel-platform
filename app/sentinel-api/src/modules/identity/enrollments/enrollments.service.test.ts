import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EnrollmentService } from './enrollments.service';
import { enrollInstructorData } from './data/enroll-instructor';
import { approveEnrollmentRequestData } from './data/approve-enrollment-request';
import { rejectEnrollmentRequestData } from './data/reject-enrollment-request';
import { ActivityNotificationService } from '../../general/notification/services/activity-notification.service';

vi.mock('./data/enroll-instructor', () => ({
    enrollInstructorData: vi.fn(),
}));

vi.mock('./data/approve-enrollment-request', () => ({
    approveEnrollmentRequestData: vi.fn(),
}));

vi.mock('./data/reject-enrollment-request', () => ({
    rejectEnrollmentRequestData: vi.fn(),
}));

vi.mock('../../general/notification/services/activity-notification.service', () => ({
    ActivityNotificationService: {
        notifySubjectEnrollmentRequestSubmitted: vi.fn(),
        notifySubjectEnrollmentRequestApproved: vi.fn(),
        notifySubjectEnrollmentRequestRejected: vi.fn(),
    },
}));

describe('EnrollmentService notification workflows', () => {
    const dbClient = {} as any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('emits subject-request submission notifications when new requests are created', async () => {
        vi.mocked(enrollInstructorData).mockResolvedValue({
            classGroupIds: ['class-1'],
            createdRequestIds: ['request-1', 'request-2'],
            institutionId: 'institution-1',
            subjectOfferingId: 'offering-1',
            subjectLabel: 'CS101 - Intro to Computing',
            requestedDepartmentIds: [],
            requestedCourseIds: [],
            requestedYearLevels: [],
            resolvedSectionIds: ['section-1', 'section-2'],
            resolvedSectionCount: 2,
            newRequestsCount: 2,
            existingRequestsCount: 0,
            existingRolesCount: 0,
            skippedCount: 0,
            total: 2,
        });

        const result = await EnrollmentService.enrollInstructor(
            dbClient,
            'instructor-1',
            {} as any,
            null,
        );

        expect(ActivityNotificationService.notifySubjectEnrollmentRequestSubmitted).toHaveBeenCalledWith({
            dbClient,
            actorUserId: 'instructor-1',
            institutionId: 'institution-1',
            subjectOfferingId: 'offering-1',
            subjectLabel: 'CS101 - Intro to Computing',
            requestIds: ['request-1', 'request-2'],
            requestCount: 2,
        });
        expect(result.newRequestsCount).toBe(2);
    });

    it('does not emit submission notifications when nothing new was created', async () => {
        vi.mocked(enrollInstructorData).mockResolvedValue({
            classGroupIds: ['class-1'],
            createdRequestIds: [],
            institutionId: 'institution-1',
            subjectOfferingId: 'offering-1',
            subjectLabel: 'CS101 - Intro to Computing',
            requestedDepartmentIds: [],
            requestedCourseIds: [],
            requestedYearLevels: [],
            resolvedSectionIds: ['section-1'],
            resolvedSectionCount: 1,
            newRequestsCount: 0,
            existingRequestsCount: 1,
            existingRolesCount: 0,
            skippedCount: 1,
            total: 1,
        });

        await EnrollmentService.enrollInstructor(dbClient, 'instructor-1', {} as any, null);

        expect(
            ActivityNotificationService.notifySubjectEnrollmentRequestSubmitted,
        ).not.toHaveBeenCalled();
    });

    it('emits aggregate approval notifications for processed request ids', async () => {
        vi.mocked(approveEnrollmentRequestData).mockResolvedValue([
            {
                request_id: 'request-1',
                class_group_id: 'class-1',
                user_id: 'instructor-1',
            },
            {
                request_id: 'request-2',
                class_group_id: 'class-2',
                user_id: 'instructor-1',
            },
        ] as any);

        const result = await EnrollmentService.approveEnrollmentRequest(
            dbClient,
            ['request-1', 'request-2'],
            'admin-1',
        );

        expect(ActivityNotificationService.notifySubjectEnrollmentRequestApproved).toHaveBeenCalledWith(
            {
                dbClient,
                actorUserId: 'admin-1',
                requestIds: ['request-1', 'request-2'],
            },
        );
        expect(result).toHaveLength(2);
    });

    it('emits aggregate rejection notifications for processed request ids', async () => {
        vi.mocked(rejectEnrollmentRequestData).mockResolvedValue(['request-3', 'request-4']);

        const result = await EnrollmentService.rejectEnrollmentRequest(
            dbClient,
            ['request-3', 'request-4'],
            'admin-1',
        );

        expect(ActivityNotificationService.notifySubjectEnrollmentRequestRejected).toHaveBeenCalledWith(
            {
                dbClient,
                actorUserId: 'admin-1',
                requestIds: ['request-3', 'request-4'],
            },
        );
        expect(result).toEqual(['request-3', 'request-4']);
    });
});
