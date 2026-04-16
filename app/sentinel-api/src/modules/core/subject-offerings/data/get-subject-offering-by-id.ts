import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

export type GetSubjectOfferingByIdDataArgs = {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
};

export async function getSubjectOfferingByIdData({
    dbClient,
    id,
    institutionId,
}: GetSubjectOfferingByIdDataArgs) {
    let query = dbClient
        .selectFrom('subject_offerings as so')
        .innerJoin('subjects as sub', 'sub.subject_id', 'so.subject_id')
        .innerJoin('terms as trm', 'trm.term_id', 'so.term_id')
        .leftJoin('subject_classification_subjects as scs', 'scs.subject_id', 'sub.subject_id')
        .leftJoin(
            'subject_classifications as scl',
            'scl.subject_classification_id',
            'scs.subject_classification_id',
        )
        .leftJoin('user_profiles as creator', 'creator.user_id', 'so.created_by')
        .leftJoin('user_profiles as updater', 'updater.user_id', 'so.updated_by')
        .select([
            'so.subject_offering_id',
            'so.subject_id',
            'sub.subject_code',
            'sub.subject_title',
            'so.term_id',
            'trm.academic_year as term_academic_year',
            'trm.semester as term_semester',
            'trm.start_date as term_start_date',
            'trm.end_date as term_end_date',
            'so.status',
            'so.created_at',
            'so.updated_at',
            'so.created_by',
            'so.updated_by',
            'creator.first_name as creator_first_name',
            'creator.last_name as creator_last_name',
            'updater.first_name as updater_first_name',
            'updater.last_name as updater_last_name',
            sql<any>`COALESCE(
                (
                    SELECT array_agg(DISTINCT sod3.department_id)
                    FROM subject_offering_departments sod3
                    WHERE sod3.subject_offering_id = so.subject_offering_id
                ),
                ARRAY[]::uuid[]
            )`.as('department_ids'),
            sql<any>`COALESCE(
                (
                    SELECT array_agg(DISTINCT soc3.course_id)
                    FROM subject_offering_courses soc3
                    WHERE soc3.subject_offering_id = so.subject_offering_id
                ),
                ARRAY[]::uuid[]
            )`.as('course_ids'),
            sql<any>`COALESCE(
                (
                    SELECT array_agg(DISTINCT sos3.section_id)
                    FROM subject_offering_sections sos3
                    WHERE sos3.subject_offering_id = so.subject_offering_id
                ),
                ARRAY[]::uuid[]
            )`.as('section_ids'),
            sql<any>`COALESCE(
                (
                    SELECT array_agg(DISTINCT soyl3.year_level)
                    FROM subject_offering_year_levels soyl3
                    WHERE soyl3.subject_offering_id = so.subject_offering_id
                ),
                ARRAY[]::smallint[]
            )`.as('year_levels'),
            sql<any>`COALESCE(
                (
                    SELECT jsonb_agg(DISTINCT jsonb_build_object(
                        'id', d.department_id,
                        'code', d.department_code,
                        'name', d.department_name
                    ))
                    FROM subject_offering_departments sod2
                    JOIN departments d ON d.department_id = sod2.department_id
                    WHERE sod2.subject_offering_id = so.subject_offering_id
                ),
                '[]'::jsonb
            )`.as('departments'),
            sql<any>`COALESCE(
                (
                    SELECT jsonb_agg(DISTINCT jsonb_build_object(
                        'id', c.course_id,
                        'code', c.code,
                        'title', c.title
                    ))
                    FROM subject_offering_courses soc2
                    JOIN courses c ON c.course_id = soc2.course_id
                    WHERE soc2.subject_offering_id = so.subject_offering_id
                ),
                '[]'::jsonb
            )`.as('courses'),
            sql<any>`COALESCE(
                (
                    SELECT jsonb_agg(DISTINCT jsonb_build_object(
                        'id', s.section_id,
                        'name', s.section_name,
                        'department_id', s.department_id,
                        'course_id', s.course_id,
                        'year_level', s.year_level
                    ))
                    FROM subject_offering_sections sos2
                    JOIN sections s ON s.section_id = sos2.section_id
                    WHERE sos2.subject_offering_id = so.subject_offering_id
                ),
                '[]'::jsonb
            )`.as('sections'),
            sql<any>`COALESCE(
                (
                    SELECT jsonb_agg(DISTINCT jsonb_build_object(
                        'id', sc.subject_classification_id,
                        'name', sc.name,
                        'type', sc.classification_type
                    ))
                    FROM subject_classification_subjects scs2
                    JOIN subject_classifications sc ON sc.subject_classification_id = scs2.subject_classification_id
                    WHERE scs2.subject_id = so.subject_id
                ),
                '[]'::jsonb
            )`.as('classifications'),
        ])
        .where('so.subject_offering_id', '=', id);

    if (institutionId) {
        query = query.where('so.institution_id', '=', institutionId);
    }

    return await query.executeTakeFirstOrThrow();
}
