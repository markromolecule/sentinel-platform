import { type DbClient } from '@sentinel/db';
import { getExamAssignmentsData } from '../data/get-exam-assignments';
import { mapExamAssignment } from './map-exam-assignment';

export async function getExamAssignments(args: {
    dbClient: DbClient;
    userId: string;
    institutionId?: string;
}) {
    const assignments = await getExamAssignmentsData(args);

    return assignments.map((assignment) =>
        mapExamAssignment({
            id: assignment.id,
            relationship: assignment.relationship,
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
            status: assignment.status ?? 'PENDING',
            scheduledAt: assignment.scheduledAt ?? null,
            createdAt: assignment.createdAt ?? null,
            updatedAt: assignment.updatedAt ?? null,
        }),
    );
}
