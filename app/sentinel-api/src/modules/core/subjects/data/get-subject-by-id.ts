import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

export type GetSubjectByIdDataArgs = {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
    includeOfferingFields?: boolean;
};

export async function getSubjectByIdData({
    dbClient,
    id,
    institutionId,
    includeOfferingFields = true,
}: GetSubjectByIdDataArgs) {
    let query = dbClient
        .selectFrom('subjects as sub')
        .leftJoin('subject_departments as sd', 'sd.subject_id', 'sub.subject_id')
        .leftJoin('course_subjects as cs', 'cs.subject_id', 'sub.subject_id')
        .leftJoin('subject_sections as ss', 'ss.subject_id', 'sub.subject_id')
        .leftJoin('subject_year_levels as syl', 'syl.subject_id', 'sub.subject_id')
        .leftJoin('user_profiles as creator', 'creator.user_id', 'sub.created_by')
        .leftJoin('user_profiles as updater', 'updater.user_id', 'sub.updated_by')
        .select([
            'sub.subject_id',
            'sub.subject_code',
            'sub.subject_title',
            'sub.created_at',
            'sub.updated_at',
            'sub.created_by',
            'sub.updated_by',
            'creator.first_name as creator_first_name',
            'creator.last_name as creator_last_name',
            'updater.first_name as updater_first_name',
            'updater.last_name as updater_last_name',
        ]);

    query = includeOfferingFields
        ? query.select([
              'sub.term_id',
              'sub.is_opened',
              'sub.offering_start_date',
              'sub.offering_end_date',
          ])
        : query.select([
              sql<string | null>`NULL`.as('term_id'),
              sql<boolean>`false`.as('is_opened'),
              sql<string | null>`NULL`.as('offering_start_date'),
              sql<string | null>`NULL`.as('offering_end_date'),
          ]);

    let scopedQuery = query.where('sub.subject_id', '=', id);

    if (institutionId) {
        scopedQuery = scopedQuery.where((eb) =>
            eb.or([
                eb('sub.institution_id', '=', institutionId),
                eb('sub.institution_id', 'is', null),
            ]),
        );
    }

    const record = await scopedQuery
        .select([
            sql<
                string[]
            >`COALESCE(array_remove(array_agg(DISTINCT sd.department_id), NULL), ARRAY[]::uuid[])`.as(
                'department_ids',
            ),
            sql<
                string[]
            >`COALESCE(array_remove(array_agg(DISTINCT cs.course_id), NULL), ARRAY[]::uuid[])`.as(
                'course_ids',
            ),
            sql<
                string[]
            >`COALESCE(array_remove(array_agg(DISTINCT ss.section_id), NULL), ARRAY[]::uuid[])`.as(
                'section_ids',
            ),
            sql<
                number[]
            >`COALESCE(array_remove(array_agg(DISTINCT syl.year_level), NULL), ARRAY[]::smallint[])`.as(
                'year_levels',
            ),
        ])
        .groupBy([
            'sub.subject_id',
            'creator.first_name',
            'creator.last_name',
            'updater.first_name',
            'updater.last_name',
        ])
        .executeTakeFirstOrThrow();

    return record;
}

export type GetSubjectByIdDataResponse = Awaited<ReturnType<typeof getSubjectByIdData>>;
