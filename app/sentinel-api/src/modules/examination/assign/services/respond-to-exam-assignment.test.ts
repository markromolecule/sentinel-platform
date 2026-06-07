import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HTTPException } from 'hono/http-exception';
import { closeOtherPendingExamAssignments } from '../data/close-other-pending-exam-assignments';
import { findRespondableExamAssignment } from '../data/find-respondable-exam-assignment';
import { updateExamAssignmentStatus } from '../data/update-exam-assignment-status';
import { ExamNotificationService } from '../../../general/notification/services/exam-notification.service';
import { respondToExamAssignment } from './respond-to-exam-assignment';

vi.mock('../data/find-respondable-exam-assignment', () => ({
    findRespondableExamAssignment: vi.fn(),
}));

vi.mock('../data/update-exam-assignment-status', () => ({
    updateExamAssignmentStatus: vi.fn(),
}));

vi.mock('../data/close-other-pending-exam-assignments', () => ({
    closeOtherPendingExamAssignments: vi.fn(),
}));

vi.mock('../../../general/notification/services/exam-notification.service', () => ({
    ExamNotificationService: {
        notifyExamAssignmentAccepted: vi.fn(),
        notifyExamAssignmentRejected: vi.fn(),
    },
}));

describe('respondToExamAssignment', () => {
    const dbClient = {} as any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('accepts a pending exam assignment', async () => {
        vi.mocked(findRespondableExamAssignment).mockResolvedValue({
            id: 'assignment-1',
            examId: 'exam-1',
            examTitle: 'Midterm Exam',
            subjectTitle: 'Physics',
            examScheduledDate: '2026-05-10T08:00:00.000Z',
            examEndDateTime: '2026-05-10T10:00:00.000Z',
            assignerId: 'assigner-1',
            assignerName: 'Jordan Instructor',
            assigneeId: 'assignee-1',
            assigneeName: 'Alex Instructor',
            status: 'PENDING',
        } as any);
        vi.mocked(updateExamAssignmentStatus).mockResolvedValue({
            id: 'assignment-1',
            status: 'ACCEPTED',
            scheduledAt: '2026-05-10T08:00:00.000Z',
            createdAt: '2026-05-09T12:00:00.000Z',
            updatedAt: '2026-05-09T12:05:00.000Z',
        } as any);

        const result = await respondToExamAssignment({
            dbClient,
            assignmentId: 'assignment-1',
            institutionId: 'institution-1',
            userId: 'assignee-1',
            status: 'ACCEPTED',
        });

        expect(updateExamAssignmentStatus).toHaveBeenCalledWith({
            dbClient,
            assignmentId: 'assignment-1',
            status: 'ACCEPTED',
        });
        expect(closeOtherPendingExamAssignments).toHaveBeenCalledWith({
            dbClient,
            examId: 'exam-1',
            excludeAssignmentId: 'assignment-1',
        });
        expect(ExamNotificationService.notifyExamAssignmentAccepted).toHaveBeenCalledWith({
            dbClient,
            recipientUserId: 'assigner-1',
            actorUserId: 'assignee-1',
            institutionId: 'institution-1',
            examId: 'exam-1',
            examTitle: 'Midterm Exam',
            assigneeName: 'Alex Instructor',
        });
        expect(result.status).toBe('ACCEPTED');
    });

    it('rejects a pending exam assignment', async () => {
        vi.mocked(findRespondableExamAssignment).mockResolvedValue({
            id: 'assignment-1',
            examId: 'exam-1',
            examTitle: 'Midterm Exam',
            subjectTitle: 'Physics',
            examScheduledDate: null,
            examEndDateTime: null,
            assignerId: 'assigner-1',
            assignerName: 'Jordan Instructor',
            assigneeId: 'assignee-1',
            assigneeName: 'Alex Instructor',
            status: 'PENDING',
        } as any);
        vi.mocked(updateExamAssignmentStatus).mockResolvedValue({
            id: 'assignment-1',
            status: 'DECLINED',
            scheduledAt: null,
            createdAt: '2026-05-09T12:00:00.000Z',
            updatedAt: '2026-05-09T12:05:00.000Z',
        } as any);

        const result = await respondToExamAssignment({
            dbClient,
            assignmentId: 'assignment-1',
            institutionId: 'institution-1',
            userId: 'assignee-1',
            status: 'DECLINED',
        });

        expect(closeOtherPendingExamAssignments).not.toHaveBeenCalled();
        expect(ExamNotificationService.notifyExamAssignmentRejected).toHaveBeenCalledWith({
            dbClient,
            recipientUserId: 'assigner-1',
            actorUserId: 'assignee-1',
            institutionId: 'institution-1',
            examId: 'exam-1',
            examTitle: 'Midterm Exam',
            assigneeName: 'Alex Instructor',
        });
        expect(result.status).toBe('DECLINED');
    });

    it('blocks responding to non-pending assignments', async () => {
        vi.mocked(findRespondableExamAssignment).mockResolvedValue({
            id: 'assignment-1',
            status: 'DECLINED',
        } as any);

        await expect(
            respondToExamAssignment({
                dbClient,
                assignmentId: 'assignment-1',
                institutionId: 'institution-1',
                userId: 'assignee-1',
                status: 'ACCEPTED',
            }),
        ).rejects.toMatchObject<Partial<HTTPException>>({
            status: 409,
            message: 'Only pending exam assignments can be responded to.',
        });
    });
});
