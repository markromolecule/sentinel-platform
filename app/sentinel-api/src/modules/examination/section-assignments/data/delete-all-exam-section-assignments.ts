import { type DbClient } from '@sentinel/db';

/**
 * Deletes all exam section assignments for a given exam.
 */
export async function deleteAllExamSectionAssignments(args: {
    dbClient: DbClient;
    examId: string;
}) {
    const { dbClient, examId } = args;

    await dbClient
        .deleteFrom('exam_section_assignments' as any)
        .where('exam_id', '=', examId)
        .execute();
}
