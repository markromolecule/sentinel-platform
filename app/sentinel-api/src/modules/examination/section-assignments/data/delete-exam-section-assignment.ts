import { type DbClient } from '@sentinel/db';

export async function deleteExamSectionAssignment(args: {
    dbClient: DbClient;
    id: string;
    examId: string;
}) {
    const { dbClient, id, examId } = args;

    const result = await dbClient
        .deleteFrom('exam_section_assignments' as any)
        .where('id', '=', id)
        .where('exam_id', '=', examId)
        .returning(['id'])
        .executeTakeFirst();

    return result ? result.id : null;
}
