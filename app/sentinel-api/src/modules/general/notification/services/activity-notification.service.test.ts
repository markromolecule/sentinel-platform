import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ActivityNotificationService } from './activity-notification.service';
import { NotificationService } from '../notification.service';

vi.mock('../notification.service', () => ({
    NotificationService: {
        createNotification: vi.fn(),
    },
}));

type FakeBuilderResult = {
    execute?: any[];
    executeTakeFirst?: any;
};

function createFakeBuilder(result: FakeBuilderResult) {
    return {
        innerJoin() {
            return this;
        },
        leftJoin() {
            return this;
        },
        select() {
            return this;
        },
        where() {
            return this;
        },
        groupBy() {
            return this;
        },
        orderBy() {
            return this;
        },
        async execute() {
            return result.execute ?? [];
        },
        async executeTakeFirst() {
            return result.executeTakeFirst;
        },
    };
}

function createFakeDbClient(results: FakeBuilderResult[]) {
    const queue = [...results];

    return {
        selectFrom: vi.fn(() => {
            const next = queue.shift();

            if (!next) {
                throw new Error('Unexpected selectFrom call');
            }

            return createFakeBuilder(next);
        }),
    } as any;
}

describe('ActivityNotificationService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('notifies institution approvers for a new subject enrollment request', async () => {
        const dbClient = createFakeDbClient([
            {
                executeTakeFirst: {
                    name: 'Jamie Instructor',
                },
            },
            {
                execute: [
                    {
                        userId: 'approver-1',
                        name: 'Admin One',
                    },
                    {
                        userId: 'approver-2',
                        name: 'Admin Two',
                    },
                ],
            },
        ]);

        await ActivityNotificationService.notifySubjectEnrollmentRequestSubmitted({
            dbClient,
            actorUserId: 'instructor-1',
            institutionId: 'institution-1',
            subjectOfferingId: 'offering-1',
            subjectLabel: 'CS101 - Intro to Computing',
            requestIds: ['request-1', 'request-2'],
            requestCount: 2,
        });

        expect(NotificationService.createNotification).toHaveBeenCalledTimes(2);
        expect(NotificationService.createNotification).toHaveBeenNthCalledWith(1, {
            dbClient,
            recipientUserId: 'approver-1',
            actorUserId: 'instructor-1',
            institutionId: 'institution-1',
            title: 'New subject enrollment request',
            message:
                'Jamie Instructor submitted a subject enrollment request for "CS101 - Intro to Computing" (2 sections).',
            actionType: 'SUBJECT_ENROLLMENT_REQUEST_SUBMITTED',
            resourceType: 'SUBJECT_ENROLLMENT_REQUEST',
            resourceId: 'offering-1',
            resourceLabel: 'CS101 - Intro to Computing',
            metadata: {
                requestIds: ['request-1', 'request-2'],
                requestCount: 2,
                subjectOfferingId: 'offering-1',
            },
        });
    });

    it('builds one aggregate approval notification per grouped request context', async () => {
        const dbClient = createFakeDbClient([
            {
                executeTakeFirst: {
                    name: 'Morgan Admin',
                },
            },
            {
                execute: [
                    {
                        requesterUserId: 'instructor-1',
                        subjectOfferingId: 'offering-1',
                        institutionId: 'institution-1',
                        subjectCode: 'CS101',
                        subjectTitle: 'Intro to Computing',
                        requesterName: 'Jamie Instructor',
                        requestCount: 2,
                        requestIds: ['request-1', 'request-2'],
                    },
                ],
            },
        ]);

        await ActivityNotificationService.notifySubjectEnrollmentRequestApproved({
            dbClient,
            actorUserId: 'admin-1',
            requestIds: ['request-1', 'request-2'],
        });

        expect(NotificationService.createNotification).toHaveBeenCalledTimes(1);
        expect(NotificationService.createNotification).toHaveBeenCalledWith({
            dbClient,
            recipientUserId: 'instructor-1',
            actorUserId: 'admin-1',
            institutionId: 'institution-1',
            title: 'Subject enrollment request approved',
            message:
                'Morgan Admin approved your subject enrollment request for "CS101 - Intro to Computing" (2 sections).',
            actionType: 'SUBJECT_ENROLLMENT_REQUEST_APPROVED',
            resourceType: 'SUBJECT_ENROLLMENT_REQUEST',
            resourceId: 'offering-1',
            resourceLabel: 'CS101 - Intro to Computing',
            metadata: {
                requestIds: ['request-1', 'request-2'],
                requestCount: 2,
                subjectOfferingId: 'offering-1',
            },
        });
    });

    it('builds one aggregate rejection notification per grouped request context', async () => {
        const dbClient = createFakeDbClient([
            {
                executeTakeFirst: {
                    name: 'Morgan Admin',
                },
            },
            {
                execute: [
                    {
                        requesterUserId: 'instructor-1',
                        subjectOfferingId: 'offering-1',
                        institutionId: 'institution-1',
                        subjectCode: 'CS101',
                        subjectTitle: 'Intro to Computing',
                        requesterName: 'Jamie Instructor',
                        requestCount: 1,
                        requestIds: ['request-3'],
                    },
                ],
            },
        ]);

        await ActivityNotificationService.notifySubjectEnrollmentRequestRejected({
            dbClient,
            actorUserId: 'admin-1',
            requestIds: ['request-3'],
        });

        expect(NotificationService.createNotification).toHaveBeenCalledTimes(1);
        expect(NotificationService.createNotification).toHaveBeenCalledWith({
            dbClient,
            recipientUserId: 'instructor-1',
            actorUserId: 'admin-1',
            institutionId: 'institution-1',
            title: 'Subject enrollment request rejected',
            message:
                'Morgan Admin rejected your subject enrollment request for "CS101 - Intro to Computing" (1 section).',
            actionType: 'SUBJECT_ENROLLMENT_REQUEST_REJECTED',
            resourceType: 'SUBJECT_ENROLLMENT_REQUEST',
            resourceId: 'offering-1',
            resourceLabel: 'CS101 - Intro to Computing',
            metadata: {
                requestIds: ['request-3'],
                requestCount: 1,
                subjectOfferingId: 'offering-1',
            },
        });
    });

    it('fans out section activity notifications to institution admins and superadmins', async () => {
        const dbClient = createFakeDbClient([
            {
                executeTakeFirst: {
                    name: 'Morgan Admin',
                },
            },
            {
                execute: [
                    {
                        userId: 'admin-2',
                        name: 'Admin Two',
                    },
                    {
                        userId: 'superadmin-1',
                        name: 'Super Admin',
                    },
                ],
            },
        ]);

        await ActivityNotificationService.notifySectionCreated({
            dbClient,
            actorUserId: 'admin-1',
            institutionId: 'institution-1',
            sectionId: 'section-1',
            sectionLabel: 'BSCS 3A',
        });

        expect(NotificationService.createNotification).toHaveBeenCalledTimes(2);
        expect(NotificationService.createNotification).toHaveBeenNthCalledWith(1, {
            dbClient,
            recipientUserId: 'admin-2',
            actorUserId: 'admin-1',
            institutionId: 'institution-1',
            title: 'Section created',
            message: 'Morgan Admin created section "BSCS 3A".',
            actionType: 'SECTION_CREATED',
            resourceType: 'SECTION',
            resourceId: 'section-1',
            resourceLabel: 'BSCS 3A',
            metadata: {
                sectionId: 'section-1',
            },
        });
    });

    it('fans out support institution operations to admin, superadmin, and instructor recipients only', async () => {
        const dbClient = createFakeDbClient([
            {
                executeTakeFirst: {
                    name: 'Support User',
                },
            },
            {
                execute: [
                    {
                        userId: 'superadmin-1',
                        name: 'Super Admin',
                    },
                    {
                        userId: 'admin-2',
                        name: 'Admin Two',
                    },
                    {
                        userId: 'instructor-3',
                        name: 'Instructor Three',
                    },
                ],
            },
        ]);

        await ActivityNotificationService.notifySupportInstitutionOperationCompleted({
            dbClient,
            actorUserId: 'support-1',
            institutionId: 'institution-1',
            institutionRecordId: 'institution-1',
            institutionLabel: 'Sentinel University',
            operation: 'UPDATED',
        });

        expect(NotificationService.createNotification).toHaveBeenCalledTimes(3);
        expect(NotificationService.createNotification).toHaveBeenNthCalledWith(1, {
            dbClient,
            recipientUserId: 'superadmin-1',
            actorUserId: 'support-1',
            institutionId: 'institution-1',
            title: 'Support operation completed',
            message: 'Support User updated institution "Sentinel University".',
            actionType: 'SUPPORT_OPERATION_COMPLETED',
            resourceType: 'SUPPORT_OPERATION',
            resourceId: 'institution-1',
            resourceLabel: 'Sentinel University',
            metadata: {
                operation: 'UPDATED',
                targetType: 'INSTITUTION',
                institutionId: 'institution-1',
            },
        });
    });
});
