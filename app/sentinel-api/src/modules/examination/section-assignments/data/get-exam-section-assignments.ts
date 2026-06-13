import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

export async function getExamSectionAssignments(args: { dbClient: DbClient; examId: string }) {
    const { dbClient, examId } = args;

    return await dbClient
        .selectFrom('exam_section_assignments as esa')
        .innerJoin('sections as s', 's.section_id', 'esa.section_id')
        .leftJoin('rooms as r', 'r.room_id', 'esa.room_id')
        .leftJoin('user_profiles as up', 'up.user_id', 'esa.instructor_id')
        .select([
            'esa.id',
            'esa.exam_id as examId',
            'esa.section_id as sectionId',
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
        ])
        .where('esa.exam_id', '=', examId)
        .orderBy('esa.created_at', 'asc')
        .execute();
}
