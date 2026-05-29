import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { closeOtherPendingExamAssignments } from '../data/close-other-pending-exam-assignments';
import { findRespondableExamAssignment } from '../data/find-respondable-exam-assignment';
import { updateExamAssignmentStatus } from '../data/update-exam-assignment-status';
import { NotificationService } from '../../../general/notification/notification.service';
import { mapExamAssignment } from './map-exam-assignment';
import { LogsService } from '../../../general/logs/logs.service';

export async function respondToExamAssignment(args: {
    dbClient: DbClient;
    assignmentId: string;
    institutionId?: string;
    userId: string;
    status: 'ACCEPTED' | 'DECLINED';
}) {
    const { dbClient, assignmentId, institutionId, userId, status } = args;

    const assignment = await findRespondableExamAssignment({
        dbClient,
        assignmentId,
        userId,
        institutionId,
    });

    if (!assignment) {
        throw new HTTPException(404, {
            message: 'Exam assignment not found.',
        });
    }

    if (assignment.status !== 'PENDING') {
        throw new HTTPException(409, {
            message: 'Only pending exam assignments can be responded to.',
        });
    }

    const updatedAssignment = await updateExamAssignmentStatus({
        dbClient,
        assignmentId,
        status,
    });

    if (status === 'ACCEPTED') {
        await closeOtherPendingExamAssignments({
            dbClient,
            examId: assignment.examId,
            excludeAssignmentId: assignmentId,
        });
    }

    if (status === 'ACCEPTED') {
        await NotificationService.notifyExamAssignmentAccepted({
            dbClient,
            recipientUserId: assignment.assignerId!,
            actorUserId: userId,
            institutionId: institutionId ?? null,
            examId: assignment.examId,
            examTitle: assignment.examTitle,
            assigneeName: assignment.assigneeName,
        });
    } else {
        await NotificationService.notifyExamAssignmentRejected({
            dbClient,
            recipientUserId: assignment.assignerId!,
            actorUserId: userId,
            institutionId: institutionId ?? null,
            examId: assignment.examId,
            examTitle: assignment.examTitle,
            assigneeName: assignment.assigneeName,
        });
    }

    // Telemetry logging
    try {
        const instId =
            institutionId ||
            (
                await dbClient
                    .selectFrom('exams')
                    .select(['institution_id'])
                    .where('exam_id', '=', assignment.examId)
                    .executeTakeFirst()
            )?.institution_id;
        if (instId) {
            await LogsService.createLog(dbClient, {
                userId,
                action:
                    status === 'ACCEPTED' ? 'exam.assignment_accepted' : 'exam.assignment_declined',
                resourceType: 'exam_assignment',
                resourceId: assignmentId,
                activeInstitutionId: instId,
                details: {
                    examId: assignment.examId,
                    status,
                },
            });
        }
    } catch (logErr) {
        console.error('Failed to log exam assignment response:', logErr);
    }

    return mapExamAssignment({
        id: updatedAssignment.id,
        relationship: 'INBOUND',
        exam: {
            id: assignment.examId,
            title: assignment.examTitle,
            subjectTitle: assignment.subjectTitle ?? null,
            scheduledDate: assignment.examScheduledDate ?? null,
            endDateTime: assignment.examEndDateTime ?? null,
        },
        assigner: {
            id: assignment.assignerId!,
            name: assignment.assignerName,
        },
        assignee: {
            id: assignment.assigneeId!,
            name: assignment.assigneeName,
        },
        status: updatedAssignment.status ?? status,
        scheduledAt: updatedAssignment.scheduledAt ?? null,
        createdAt: updatedAssignment.createdAt ?? null,
        updatedAt: updatedAssignment.updatedAt ?? null,
    });
}
