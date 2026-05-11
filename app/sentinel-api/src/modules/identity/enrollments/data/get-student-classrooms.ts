import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

export const getStudentClassroomsData = async ({
    dbClient,
    userId,
}: {
    dbClient: DbClient;
    userId: string;
}) => {
    return await dbClient
        .selectFrom('students as st')
        .innerJoin('enrollments as enr', 'enr.student_id', 'st.student_id')
        .innerJoin('class_groups as cg', 'cg.class_group_id', 'enr.class_group_id')
        .innerJoin('subjects as s', 's.subject_id', 'cg.subject_id')
        .innerJoin('subject_offerings as so', 'so.subject_offering_id', 'cg.subject_offering_id')
        .innerJoin('terms as t', 't.term_id', 'so.term_id')
        .leftJoin('sections as sec', 'sec.section_id', 'cg.section_id')
        .select((eb) => [
            'cg.class_group_id as id',
            's.subject_id as subjectId',
            's.subject_code as subjectCode',
            's.subject_title as subjectTitle',
            'sec.section_id as sectionId',
            'sec.section_name as sectionName',
            't.term_id as termId',
            sql<string>`concat('AY ', t.academic_year, ' ', t.semester)`.as('term'),
            eb
                .selectFrom('class_roles as cr')
                .innerJoin('user_profiles as up', 'up.user_id', 'cr.user_id')
                .select(
                    sql<
                        string[]
                    >`coalesce(json_agg(NULLIF(TRIM(concat_ws(' ', up.first_name, up.last_name)), '')), '[]'::json)`.as(
                        'instructors',
                    ),
                )
                .whereRef('cr.class_group_id', '=', 'cg.class_group_id')
                .where(
                    'cr.role_id',
                    '=',
                    sql<number>`(select role_id from roles where role_name = 'instructor')`,
                )
                .as('instructors'),
            'enr.enrolled_at as enrolledAt',
        ])
        .where('st.user_id', '=', userId)
        .orderBy('t.start_date', 'desc')
        .orderBy('s.subject_code', 'asc')
        .execute();
};
