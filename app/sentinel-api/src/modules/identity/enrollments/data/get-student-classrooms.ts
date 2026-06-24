import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

/**
 * Returns the active classrooms a student is enrolled in for the student
 * classroom experience. Archived classrooms are excluded at the query level.
 */
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
            sql<any>`(
                select coalesce(json_agg(distinct nullif(trim(concat_ws(' ', up.first_name, up.last_name)), '')), '[]'::json)
                from (
                    select instructor_user_id as user_id from classroom_instructor_assignments where class_group_id = cg.class_group_id
                    union
                    select user_id from class_roles where class_group_id = cg.class_group_id and role_id = (select role_id from roles where role_name = 'instructor')
                ) ids
                join user_profiles up on up.user_id = ids.user_id
            )`.as('instructors'),
            'enr.enrolled_at as enrolledAt',
        ])
        .where('st.user_id', '=', userId)
        .where('cg.archived_at', 'is', null)
        .orderBy('t.start_date', 'desc')
        .orderBy('s.subject_code', 'asc')
        .execute();
};
