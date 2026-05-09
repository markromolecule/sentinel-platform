import { type DbClient } from '@sentinel/db';

export async function findExistingExamAssignment(args: {
    dbClient: DbClient;
    examId: string;
    assigneeId: string;
}) {
    const { dbClient, examId, assigneeId } = args;

    return await dbClient
        .selectFrom('proctor_assignments')
        .select([
            'assignment_id as id',
            'status',
            'scheduled_at as scheduledAt',
            'created_at as createdAt',
            'updated_at as updatedAt',
        ])
        .where('exam_id', '=', examId)
        .where('instructor_id', '=', assigneeId)
        .executeTakeFirst();
}
