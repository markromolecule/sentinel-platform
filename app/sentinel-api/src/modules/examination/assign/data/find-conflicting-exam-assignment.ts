import { type DbClient } from '@sentinel/db';

const ACTIVE_ASSIGNMENT_STATUSES = ['PENDING', 'ACCEPTED', 'ACTIVE', 'SCHEDULED'] as const;

export async function findConflictingExamAssignment(args: {
    dbClient: DbClient;
    examId: string;
    assigneeId: string;
}) {
    const { dbClient, examId, assigneeId } = args;

    return await dbClient
        .selectFrom('proctor_assignments')
        .select(['assignment_id as id', 'instructor_id as assigneeId', 'status'])
        .where('exam_id', '=', examId)
        .where('instructor_id', '!=', assigneeId)
        .where('status', 'in', [...ACTIVE_ASSIGNMENT_STATUSES])
        .executeTakeFirst();
}
