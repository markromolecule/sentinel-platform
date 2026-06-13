import type { ExamAssignmentRecord } from './exam-assignment.types';

function toIsoString(value: string | Date | null) {
    if (!value) {
        return null;
    }

    const parsed = value instanceof Date ? value : new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export function mapExamAssignment(record: ExamAssignmentRecord) {
    return {
        id: record.id,
        relationship: record.relationship,
        exam: {
            id: record.exam.id,
            title: record.exam.title,
            subjectTitle: record.exam.subjectTitle,
            scheduledDate: toIsoString(record.exam.scheduledDate),
            endDateTime: toIsoString(record.exam.endDateTime),
            roomName: record.exam.roomName ?? null,
            sectionNames: record.exam.sectionNames ?? [],
        },
        assigner: {
            id: record.assigner.id,
            name: record.assigner.name,
            avatarUrl: record.assigner.avatarUrl ?? null,
        },
        assignee: {
            id: record.assignee.id,
            name: record.assignee.name,
            avatarUrl: record.assignee.avatarUrl ?? null,
        },
        status: record.status,
        scheduledAt: toIsoString(record.scheduledAt),
        createdAt: toIsoString(record.createdAt),
        updatedAt: toIsoString(record.updatedAt),
    };
}
