import { type DbClient } from '@sentinel/db';

export async function saveExamAssignment(args: {
    dbClient: DbClient;
    existingAssignmentId?: string;
    examId: string;
    assigneeId: string;
    scheduledAt?: string | Date | null;
}) {
    const { dbClient, existingAssignmentId, examId, assigneeId, scheduledAt } = args;

    if (existingAssignmentId) {
        const updated = await dbClient
            .updateTable('proctor_assignments')
            .set({
                status: 'PENDING',
                scheduled_at: scheduledAt ? new Date(scheduledAt) : null,
                updated_at: new Date(),
            })
            .where('assignment_id', '=', existingAssignmentId)
            .returning([
                'assignment_id as id',
                'status',
                'scheduled_at as scheduledAt',
                'created_at as createdAt',
                'updated_at as updatedAt',
            ])
            .executeTakeFirstOrThrow();

        return updated;
    }

    return await dbClient
        .insertInto('proctor_assignments')
        .values({
            exam_id: examId,
            instructor_id: assigneeId,
            status: 'PENDING',
            scheduled_at: scheduledAt ? new Date(scheduledAt) : null,
            updated_at: new Date(),
        })
        .returning([
            'assignment_id as id',
            'status',
            'scheduled_at as scheduledAt',
            'created_at as createdAt',
            'updated_at as updatedAt',
        ])
        .executeTakeFirstOrThrow();
}
