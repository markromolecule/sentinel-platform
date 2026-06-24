import { type DbClient } from '@sentinel/db';

type AssignmentSummaryRecord = {
    class_group_id: string | null;
    section_id: string;
    section_name: string | null;
    room_id: string | null;
};

/**
 * Mirrors the primary classroom assignment back onto the denormalized `exams`
 * row so legacy consumers can still read the exam's representative classroom,
 * section, and room directly from the exam record.
 */
export async function syncExamAssignmentSummary(args: { dbClient: DbClient; examId: string }) {
    const { dbClient, examId } = args;

    const primaryAssignment = (await dbClient
        .selectFrom('exam_section_assignments as esa')
        .innerJoin('sections as s', 's.section_id', 'esa.section_id')
        .select([
            'esa.class_group_id',
            'esa.section_id',
            's.section_name',
            'esa.room_id',
        ])
        .where('esa.exam_id', '=', examId)
        .orderBy('esa.created_at', 'asc')
        .orderBy('esa.id', 'asc')
        .executeTakeFirst()) as AssignmentSummaryRecord | undefined;

    await dbClient
        .updateTable('exams')
        .set({
            class_group_id: primaryAssignment?.class_group_id ?? null,
            section_id: primaryAssignment?.section_id ?? null,
            section_name: primaryAssignment?.section_name ?? null,
            room_id: primaryAssignment?.room_id ?? null,
            exam_category: 'CLASSROOM',
            updated_at: new Date(),
        })
        .where('exam_id', '=', examId)
        .executeTakeFirst();
}
