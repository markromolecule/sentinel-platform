import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

/**
 * Creates many exam section assignments in one write while preserving the
 * classroom identifier selected for each row.
 */
export async function createExamSectionAssignmentsBatch(args: {
    dbClient: DbClient;
    examId: string;
    assignments: Array<{
        sectionId: string;
        classGroupId?: string | null;
        roomId?: string | null;
        instructorId?: string | null;
        scheduledAt?: string | Date | null;
    }>;
}) {
    const { dbClient, examId, assignments } = args;

    if (assignments.length === 0) {
        return [];
    }

    const values = assignments.map((a) => ({
        exam_id: examId,
        section_id: a.sectionId,
        class_group_id: a.classGroupId || null,
        room_id: a.roomId || null,
        instructor_id: a.instructorId || null,
        scheduled_at: a.scheduledAt ? new Date(a.scheduledAt) : null,
        updated_at: new Date(),
    }));

    const result = await dbClient
        .insertInto('exam_section_assignments' as any)
        .values(values)
        .returning('id')
        .execute();

    const ids = result.map((r: any) => r.id);
    if (ids.length === 0) {
        return [];
    }

    return await dbClient
        .selectFrom('exam_section_assignments as esa')
        .innerJoin('sections as s', 's.section_id', 'esa.section_id')
        .leftJoin('class_groups as cg', 'cg.class_group_id', 'esa.class_group_id')
        .leftJoin('rooms as r', 'r.room_id', 'esa.room_id')
        .leftJoin('user_profiles as up', 'up.user_id', 'esa.instructor_id')
        .select([
            'esa.id',
            'esa.exam_id as examId',
            'esa.section_id as sectionId',
            'esa.class_group_id as classGroupId',
            's.section_name as sectionName',
            'esa.room_id as roomId',
            'r.room_name as roomName',
            'esa.instructor_id as instructorId',
            sql<string | null>`case 
                when up.user_id is not null then trim(concat(up.first_name, ' ', up.last_name))
                else null
            end`.as('instructorName'),
            'esa.scheduled_at as scheduledAt',
            'esa.created_at as createdAt',
            'esa.updated_at as updatedAt',
            'cg.class_name as classGroupName',
        ])
        .where('esa.id', 'in', ids)
        .execute();
}
