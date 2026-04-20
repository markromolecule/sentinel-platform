import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';
import { getProctorAssignmentColumnSupport } from '../../exams/helper/exam-schema-compat';

export type GetGradingExamsDataArgs = {
    dbClient: DbClient;
    userId?: string;
    institutionId?: string;
    sectionId?: string;
};

export async function getGradingExamsData({
    dbClient,
    userId,
    institutionId,
    sectionId,
}: GetGradingExamsDataArgs) {
    const proctorAssignmentSupport = await getProctorAssignmentColumnSupport(dbClient);
    let query = dbClient
        .selectFrom('exams as e')
        .leftJoin('subjects as s', 's.subject_id', 'e.subject_id')
        .leftJoin('exam_assigned_sections as eas', 'eas.exam_id', 'e.exam_id')
        .leftJoin('sections as sec', 'sec.section_id', 'eas.section_id')
        .leftJoin('class_groups as cg', (join) =>
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
        .leftJoin('enrollments as enr', 'enr.class_group_id', 'cg.class_group_id');

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
            'e.exam_id as id',
            'e.title',
            's.subject_title as subject',
            'e.scheduled_date as scheduledDate',
            'e.end_date_time as endDateTime',
            sql<number>`cast(count(distinct enr.student_id) as integer)`.as('totalStudents'),
            sql<number>`cast(count(distinct case
                when (
                    select latest_attempt.completed_at
                    from exam_attempts as latest_attempt
                    where latest_attempt.exam_id = e.exam_id
                      and latest_attempt.student_id = enr.student_id
                    order by latest_attempt.created_at desc nulls last
                    limit 1
                ) is not null then enr.student_id
            end) as integer)`.as('submittedCount'),
            sql<number>`cast(count(distinct case
                when (
                    select latest_attempt.score
                    from exam_attempts as latest_attempt
                    where latest_attempt.exam_id = e.exam_id
                      and latest_attempt.student_id = enr.student_id
                    order by latest_attempt.created_at desc nulls last
                    limit 1
                ) is not null then enr.student_id
            end) as integer)`.as('gradedCount'),
            sql<string[]>`coalesce(
                array_remove(array_agg(distinct eas.section_id), null),
                '{}'
            )`.as('sectionIds'),
            sql<string[]>`coalesce(
                array_remove(array_agg(distinct sec.section_name), null),
                '{}'
            )`.as('sectionNames'),
        ])
        .groupBy(['e.exam_id', 'e.title', 's.subject_title', 'e.scheduled_date', 'e.updated_at'])
        .orderBy('e.updated_at', 'desc')
        .execute();

    return result;
}
