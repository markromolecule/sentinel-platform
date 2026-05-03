import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

export type GetSubjectOfferingsDataArgs = {
    dbClient: DbClient;
    institutionId?: string;
    departmentId?: string;
    courseId?: string;
    search?: string;
    subjectId?: string;
    termId?: string;
    visibility?: 'default' | 'requestable';
    instructorDepartmentId?: string;
};

export async function getSubjectOfferingsData({
    dbClient,
    institutionId,
    departmentId,
    courseId,
    search,
    subjectId,
    termId,
    visibility,
    instructorDepartmentId,
}: GetSubjectOfferingsDataArgs) {
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
            'so.institution_id',
            'so.source_record_id',
            'so.inheritance_status',
            'so.overridden_at',
            'so.overridden_by',
            'so.hidden_at',
            'so.hidden_by',
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
        ]);

    if (visibility === 'requestable') {
        query = query.where('so.status', 'in', ['OPEN', 'DRAFT']);

        if (instructorDepartmentId) {
            query = query.where((eb) =>
                eb.or([
                    eb('scl.classification_type', '=', 'GENERAL'),
                    // If no departments are explicitly assigned, it's considered open to everyone
                    eb.not(
                        eb.exists(
                            eb
                                .selectFrom('subject_offering_departments')
                                .whereRef('subject_offering_id', '=', 'so.subject_offering_id')
                                .select('subject_offering_id'),
                        ),
                    ),
                    eb.exists(
                        eb
                            .selectFrom('subject_offering_departments as sod_inner')
                            .whereRef(
                                'sod_inner.subject_offering_id',
                                '=',
                                'so.subject_offering_id',
                            )
                            .where('sod_inner.department_id', '=', instructorDepartmentId)
                            .select('sod_inner.subject_offering_id'),
                    ),
                    // If it's a core subject but offered to multiple departments, some might consider it "multi-department"
                    // but the requirement "assigned to their department OR marked as multi-department" is key.
                    // Let's assume multi-department means > 1 department assigned.
                    eb.exists(
                        eb
                            .selectFrom('subject_offering_departments as sod_count')
                            .whereRef(
                                'sod_count.subject_offering_id',
                                '=',
                                'so.subject_offering_id',
                            )
                            .select(eb.fn.count('department_id').as('dept_count'))
                            .groupBy('subject_offering_id')
                            .having(eb.fn.count('department_id'), '>', 1),
                    ),
                ]),
            );
        }
    }

    if (institutionId) {
        query = query.where('so.institution_id', '=', institutionId);
    }

    if (departmentId) {
        query = query.where((eb) =>
            eb.exists(
                eb
                    .selectFrom('subject_offering_departments')
                    .whereRef('subject_offering_id', '=', 'so.subject_offering_id')
                    .where('department_id', '=', departmentId)
                    .select('subject_offering_id'),
            ),
        );
    }

    if (courseId) {
        query = query.where((eb) =>
            eb.exists(
                eb
                    .selectFrom('subject_offering_courses')
                    .whereRef('subject_offering_id', '=', 'so.subject_offering_id')
                    .where('course_id', '=', courseId)
                    .select('subject_offering_id'),
            ),
        );
    }

    if (search) {
        query = query.where((eb) =>
            eb.or([
                eb('sub.subject_code', 'ilike', `%${search}%`),
                eb('sub.subject_title', 'ilike', `%${search}%`),
                eb('trm.academic_year', 'ilike', `%${search}%`),
                eb('trm.semester', 'ilike', `%${search}%`),
            ]),
        );
    }

    if (subjectId) {
        query = query.where('so.subject_id', '=', subjectId);
    }

    if (termId) {
        query = query.where('so.term_id', '=', termId);
    }

    return await query
        .orderBy('trm.start_date', 'desc')
        .orderBy('sub.subject_title', 'asc')
        .execute();
}
