import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';
import { getProctorAssignmentColumnSupport } from '../../exams/helper/exam-schema-compat';

export type GetGradingStudentsDataArgs = {
    dbClient: DbClient;
    examId: string;
    userId?: string;
    institutionId?: string;
    sectionId?: string;
};

export async function getGradingStudentsData({
    dbClient,
    examId,
    userId,
    institutionId,
    sectionId,
}: GetGradingStudentsDataArgs) {
    const proctorAssignmentSupport = await getProctorAssignmentColumnSupport(dbClient);
    let query = dbClient
        .selectFrom('exams as e')
        .leftJoin('exam_assigned_sections as eas', 'eas.exam_id', 'e.exam_id')
        .leftJoin('sections as sec', 'sec.section_id', 'eas.section_id')
        .innerJoin('class_groups as cg', (join) =>
            join.on((eb) =>
                eb.or([
                    eb('cg.class_group_id', '=', eb.ref('e.class_group_id')),
                    eb.and([
                        eb('cg.section_id', '=', eb.ref('eas.section_id')),
                        eb('cg.subject_id', '=', eb.ref('e.subject_id')),
                    ]),
                ]),
            ),
        )
        .innerJoin('enrollments as enr', 'enr.class_group_id', 'cg.class_group_id')
        .innerJoin('students as st', 'st.student_id', 'enr.student_id')
        .innerJoin('user_profiles as up', 'up.user_id', 'st.user_id')
        .where('e.exam_id', '=', examId);

    if (institutionId) {
        query = query.where('e.institution_id', '=', institutionId);
    }

    if (userId) {
        const visibilityPredicates = [sql<boolean>`e.created_by = ${userId}`];

        if (proctorAssignmentSupport.assigneeColumn === 'instructor_id') {
            visibilityPredicates.push(sql<boolean>`e.exam_id in (
                select pa.exam_id
                from proctor_assignments as pa
                where pa.instructor_id = ${userId}
                  and pa.exam_id is not null
            )`);
        }

        if (proctorAssignmentSupport.assigneeColumn === 'user_id') {
            visibilityPredicates.push(sql<boolean>`e.exam_id in (
                select pa.exam_id
                from proctor_assignments as pa
                where pa.user_id = ${userId}
                  and pa.exam_id is not null
            )`);
        }

        query = query.where(sql<boolean>`(${sql.join(visibilityPredicates, sql` or `)})`);
    }

    if (sectionId) {
        query = query.where('eas.section_id', '=', sectionId);
    }

    const result = await query
        .select([
            'st.student_id as id',
            sql<string>`trim(concat(up.first_name, ' ', up.last_name))`.as('name'),
            'st.student_number as studentId',
            'eas.section_id as sectionId',
            'sec.section_name as sectionName',
            sql<string | null>`(
                select latest_attempt.attempt_id
                from exam_attempts as latest_attempt
                where latest_attempt.exam_id = e.exam_id
                  and latest_attempt.student_id = st.student_id
                order by latest_attempt.created_at desc nulls last
                limit 1
            )`.as('attemptId'),
            sql<Date | null>`(
                select latest_attempt.completed_at
                from exam_attempts as latest_attempt
                where latest_attempt.exam_id = e.exam_id
                  and latest_attempt.student_id = st.student_id
                order by latest_attempt.created_at desc nulls last
                limit 1
            )`.as('completed_at'),
            sql<number | null>`(
                select latest_attempt.score
                from exam_attempts as latest_attempt
                where latest_attempt.exam_id = e.exam_id
                  and latest_attempt.student_id = st.student_id
                order by latest_attempt.created_at desc nulls last
                limit 1
            )`.as('score'),
            sql<number>`coalesce((
                select latest_attempt.total_score
                from exam_attempts as latest_attempt
                where latest_attempt.exam_id = e.exam_id
                  and latest_attempt.student_id = st.student_id
                order by latest_attempt.created_at desc nulls last
                limit 1
            ), (
                select coalesce(sum(eq.points), 0)
                from exam_questions as eq
                where eq.exam_id = e.exam_id
            ))`.as('maxScore'),
        ])
        .groupBy([
            'st.student_id',
            'up.first_name',
            'up.last_name',
            'st.student_number',
            'eas.section_id',
            'sec.section_name',
            'e.exam_id',
        ])
        .execute();

    return result;
}
