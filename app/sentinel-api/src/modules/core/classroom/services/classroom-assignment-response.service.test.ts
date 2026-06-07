import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    acknowledgeClassroomAssignment,
    flagClassroomAssignment,
} from './classroom-assignment-response.service';
import { ClassroomNotificationService } from '../../../general/notification/services/classroom-notification.service';
import { LogsService } from '../../../general/logs/logs.service';

vi.mock('../../../general/notification/services/classroom-notification.service', () => ({
    ClassroomNotificationService: {
        notifyClassroomAssignmentAcknowledged: vi.fn().mockResolvedValue(undefined),
        notifyClassroomAssignmentFlagged: vi.fn().mockResolvedValue(undefined),
        notifyClassroomInstructorAssigned: vi.fn().mockResolvedValue(undefined),
    },
}));

vi.mock('../../../general/logs/logs.service', () => ({
    LogsService: {
        createLog: vi.fn().mockResolvedValue(undefined),
    },
}));

vi.mock('./classroom-access-query.service', () => ({
    getAccessibleClassroomOrThrow: vi.fn().mockResolvedValue({}),
}));

function makeDbClient({
    assignment = { assignment_id: 'asgn-1', status: 'PENDING_ACK' },
    classroom = {
        institution_id: 'inst-1',
        class_name: 'Physics 101',
        subject_title: 'Physics',
        section_name: 'BSCS 3A',
    },
    headAssignment = { instructor_user_id: 'head-1' },
    instructorProfile = { name: 'Maria Santos' },
}: {
    assignment?: any;
    classroom?: any;
    headAssignment?: any | null;
    instructorProfile?: any;
} = {}) {
    const executeTakeFirst = vi.fn();
    const execute = vi.fn().mockResolvedValue([]);
    const updateTable = vi.fn(() => ({
        set: vi.fn(() => ({
            where: vi.fn().mockReturnThis(),
            execute,
        })),
    }));

    let selectFromCallCount = 0;
    const selectFrom = vi.fn(() => {
        selectFromCallCount++;
        const call = selectFromCallCount;
        return {
            select: vi.fn().mockReturnThis(),
            innerJoin: vi.fn().mockReturnThis(),
            leftJoin: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            executeTakeFirst: vi.fn().mockImplementation(() => {
                if (call === 1) return Promise.resolve(assignment);
                if (call === 2) return Promise.resolve(classroom);
                if (call === 3) return Promise.resolve(headAssignment);
                if (call === 4) return Promise.resolve(instructorProfile);
                return Promise.resolve(null);
            }),
        };
    });

    return {
        selectFrom,
        updateTable,
        _execute: execute,
    } as any;
}

describe('acknowledgeClassroomAssignment — notifications & audit', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('notifies the head instructor when a non-head acknowledges the assignment', async () => {
        const dbClient = makeDbClient();

        await acknowledgeClassroomAssignment({
            dbClient,
            classGroupId: 'class-1',
            instructorUserId: 'instructor-1',
            justification: 'Confirmed availability.',
        });

        expect(ClassroomNotificationService.notifyClassroomAssignmentAcknowledged).toHaveBeenCalledWith(
            expect.objectContaining({
                dbClient,
                recipientUserId: 'head-1',
                actorUserId: 'instructor-1',
                classGroupId: 'class-1',
                institutionId: 'inst-1',
                instructorName: 'Maria Santos',
            }),
        );
    });

    it('writes an audit log for the acknowledgment', async () => {
        const dbClient = makeDbClient();

        await acknowledgeClassroomAssignment({
            dbClient,
            classGroupId: 'class-1',
            instructorUserId: 'instructor-1',
        });

        expect(LogsService.createLog).toHaveBeenCalledWith(
            dbClient,
            expect.objectContaining({
                action: 'classroom_assignment.acknowledged',
                resourceType: 'classroom_instructor_assignment',
                resourceId: 'class-1',
                activeInstitutionId: 'inst-1',
            }),
        );
    });

    it('does not notify when the acknowledging instructor is the head', async () => {
        const dbClient = makeDbClient({
            headAssignment: { instructor_user_id: 'instructor-1' },
        });

        await acknowledgeClassroomAssignment({
            dbClient,
            classGroupId: 'class-1',
            instructorUserId: 'instructor-1',
        });

        expect(ClassroomNotificationService.notifyClassroomAssignmentAcknowledged).not.toHaveBeenCalled();
    });

    it('skips notification silently when no head assignment exists', async () => {
        const dbClient = makeDbClient({ headAssignment: null });

        await expect(
            acknowledgeClassroomAssignment({
                dbClient,
                classGroupId: 'class-1',
                instructorUserId: 'instructor-1',
            }),
        ).resolves.not.toThrow();

        expect(ClassroomNotificationService.notifyClassroomAssignmentAcknowledged).not.toHaveBeenCalled();
    });

    it('does not surface notification errors to the caller', async () => {
        vi.mocked(ClassroomNotificationService.notifyClassroomAssignmentAcknowledged).mockRejectedValueOnce(
            new Error('Notification service unavailable'),
        );

        const dbClient = makeDbClient();

        await expect(
            acknowledgeClassroomAssignment({
                dbClient,
                classGroupId: 'class-1',
                instructorUserId: 'instructor-1',
            }),
        ).resolves.not.toThrow();
    });
});

describe('flagClassroomAssignment — notifications & audit', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('notifies the head instructor when an assignment is flagged', async () => {
        const dbClient = makeDbClient();

        await flagClassroomAssignment({
            dbClient,
            classGroupId: 'class-2',
            instructorUserId: 'instructor-2',
            flagReason: 'Workload exceeds limit.',
        });

        expect(ClassroomNotificationService.notifyClassroomAssignmentFlagged).toHaveBeenCalledWith(
            expect.objectContaining({
                dbClient,
                recipientUserId: 'head-1',
                actorUserId: 'instructor-2',
                classGroupId: 'class-2',
                flagReason: 'Workload exceeds limit.',
            }),
        );
    });

    it('writes an audit log for the flag action', async () => {
        const dbClient = makeDbClient();

        await flagClassroomAssignment({
            dbClient,
            classGroupId: 'class-2',
            instructorUserId: 'instructor-2',
            flagReason: 'Workload exceeds limit.',
            justification: 'Already at 5 classrooms.',
        });

        expect(LogsService.createLog).toHaveBeenCalledWith(
            dbClient,
            expect.objectContaining({
                action: 'classroom_assignment.flagged',
                resourceType: 'classroom_instructor_assignment',
                resourceId: 'class-2',
                activeInstitutionId: 'inst-1',
                details: expect.objectContaining({
                    flagReason: 'Workload exceeds limit.',
                    justification: 'Already at 5 classrooms.',
                }),
            }),
        );
    });

    it('does not surface flag notification errors to the caller', async () => {
        vi.mocked(ClassroomNotificationService.notifyClassroomAssignmentFlagged).mockRejectedValueOnce(
            new Error('Downstream error'),
        );

        const dbClient = makeDbClient();

        await expect(
            flagClassroomAssignment({
                dbClient,
                classGroupId: 'class-2',
                instructorUserId: 'instructor-2',
                flagReason: 'Conflict detected.',
            }),
        ).resolves.not.toThrow();
    });
});
