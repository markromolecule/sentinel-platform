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
        .leftJoin(
            'subject_offering_departments as sod',
            'sod.subject_offering_id',
            'so.subject_offering_id',
        )
        .leftJoin(
            'subject_offering_courses as soc',
            'soc.subject_offering_id',
            'so.subject_offering_id',
        )
        .leftJoin(
            'subject_offering_sections as sos',
            'sos.subject_offering_id',
            'so.subject_offering_id',
        )
        .leftJoin(
            'subject_offering_year_levels as soyl',
            'soyl.subject_offering_id',
            'so.subject_offering_id',
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
            sql<string[]>`COALESCE(array_remove(array_agg(DISTINCT sod.department_id), NULL), ARRAY[]::uuid[])`.as(
                'department_ids',
            ),
            sql<string[]>`COALESCE(array_remove(array_agg(DISTINCT soc.course_id), NULL), ARRAY[]::uuid[])`.as(
                'course_ids',
            ),
            sql<string[]>`COALESCE(array_remove(array_agg(DISTINCT sos.section_id), NULL), ARRAY[]::uuid[])`.as(
                'section_ids',
            ),
            sql<number[]>`COALESCE(array_remove(array_agg(DISTINCT soyl.year_level), NULL), ARRAY[]::smallint[])`.as(
                'year_levels',
            ),
        ])
        .where('so.subject_offering_id', '=', id)
        .groupBy([
            'so.subject_offering_id',
            'sub.subject_code',
            'sub.subject_title',
            'trm.academic_year',
            'trm.semester',
            'trm.start_date',
            'trm.end_date',
            'creator.first_name',
            'creator.last_name',
            'updater.first_name',
            'updater.last_name',
        ]);

    if (institutionId) {
        query = query.where('so.institution_id', '=', institutionId);
    }

    return await query.executeTakeFirstOrThrow();
}
