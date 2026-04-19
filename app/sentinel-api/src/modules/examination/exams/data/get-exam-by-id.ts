import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';
import { buildStudentAttemptSelects } from '../../history/data/build-student-attempt-selects';
import { getExamColumnSupport } from '../helper/exam-schema-compat';
import type { RawExamRecord } from '../services/map-exam-response';

export type GetExamByIdDataArgs = {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
    studentUserId?: string;
};

export async function getExamByIdData({
    dbClient,
    id,
    institutionId,
    studentUserId,
}: GetExamByIdDataArgs) {
    const columnSupport = await getExamColumnSupport(dbClient);

    let query = dbClient
        .selectFrom('exams as e')
        .leftJoin('subjects as s', 's.subject_id', 'e.subject_id');

    if (columnSupport.hasRoomId) {
        query = query.leftJoin('rooms as r', 'r.room_id', 'e.room_id');
    }

    query = query
        .select([
            'e.exam_id',
            'e.title',
            'e.description',
            'e.duration_minutes',
            'e.passing_score',
            'e.status',
            'e.subject_id',
            'e.scheduled_date',
            'e.end_date_time',
            'e.published_at',
            'e.question_count',
            'e.created_at',
            'e.updated_at',
            'e.institution_id',
            's.subject_title',
            columnSupport.hasRoomId ? 'e.room_id' : sql<string | null>`null`.as('room_id'),
            columnSupport.hasRoomId
                ? sql<string | null>`r.room_name`.as('room_name')
                : sql<string | null>`null`.as('room_name'),
            columnSupport.hasSectionId ? 'e.section_id' : sql<string | null>`null`.as('section_id'),
            columnSupport.hasSectionName
                ? 'e.section_name'
                : sql<string | null>`null`.as('section_name'),
            (eb) =>
                eb
                    .selectFrom('exam_assigned_sections as eas')
                    .select(sql<string[]>`array_agg(eas.section_id)`.as('section_ids'))
                    .whereRef('eas.exam_id', '=', 'e.exam_id')
                    .as('assigned_section_ids'),
            sql<string | null>`null`.as('linked_section_name'),
            ...buildStudentAttemptSelects(studentUserId),
        ])
        .where('e.exam_id', '=', id);

    if (institutionId) {
        query = query.where('e.institution_id', '=', institutionId);
    }

    if (studentUserId) {
        query = query.where('e.published_at', 'is not', null).where(
            sql<boolean>`exists (
                    select 1
                    from students as st
                    inner join enrollments as enr on enr.student_id = st.student_id
                    inner join class_groups as cg on cg.class_group_id = enr.class_group_id
                    inner join subject_offerings as so on so.subject_offering_id = cg.subject_offering_id
                    where st.user_id = ${studentUserId}
                      and so.subject_id = e.subject_id
                      and (
                        ${columnSupport.hasSectionId ? sql`e.section_id is null or cg.section_id = e.section_id` : sql`true`}
                        or exists (
                            select 1 from exam_assigned_sections as eas
                            where eas.exam_id = e.exam_id
                              and eas.section_id = cg.section_id
                        )
                      )
                )`,
        );
    }

    return (await query.executeTakeFirst()) as RawExamRecord | undefined;
}
