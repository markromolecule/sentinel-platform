import { type DbClient } from '@sentinel/db';

export async function closeOtherPendingExamAssignments(args: {
    dbClient: DbClient;
    examId: string;
    excludeAssignmentId: string;
}) {
    const { dbClient, examId, excludeAssignmentId } = args;

    await dbClient
        .updateTable('proctor_assignments')
        .set({
            status: 'DECLINED',
            updated_at: new Date(),
        })
        .where('exam_id', '=', examId)
        .where('assignment_id', '!=', excludeAssignmentId)
        .where('status', '=', 'PENDING')
        .execute();
}
