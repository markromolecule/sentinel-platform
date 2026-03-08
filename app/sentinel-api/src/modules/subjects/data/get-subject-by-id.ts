import { type DbClient } from '@/lib/create-db-client';
import { sql } from 'kysely';

export type GetSubjectByIdDataArgs = {
    dbClient: DbClient;
    id: string;
};

export async function getSubjectByIdData({ dbClient, id }: GetSubjectByIdDataArgs) {
    const record = await dbClient
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
        .where('sub.subject_id', '=', id)
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
