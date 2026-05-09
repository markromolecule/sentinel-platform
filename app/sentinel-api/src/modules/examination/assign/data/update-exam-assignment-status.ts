import { type DbClient } from '@sentinel/db';

export async function updateExamAssignmentStatus(args: {
    dbClient: DbClient;
    assignmentId: string;
    status: 'ACCEPTED' | 'DECLINED';
}) {
    const { dbClient, assignmentId, status } = args;

    return await dbClient
        .updateTable('proctor_assignments')
        .set({
            status,
            updated_at: new Date(),
        })
        .where('assignment_id', '=', assignmentId)
        .returning([
            'assignment_id as id',
            'status',
            'scheduled_at as scheduledAt',
            'created_at as createdAt',
            'updated_at as updatedAt',
        ])
        .executeTakeFirstOrThrow();
}
