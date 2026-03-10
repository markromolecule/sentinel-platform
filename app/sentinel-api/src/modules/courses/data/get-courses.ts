import { type DbClient } from '@sentinel/db';

export type GetCoursesDataArgs = {
    dbClient: DbClient;
    institutionId: string;
};

export async function getCoursesData({ dbClient, institutionId }: GetCoursesDataArgs) {
    const records = await dbClient
        .selectFrom('courses as c')
        .leftJoin('user_profiles as creator', 'creator.user_id', 'c.created_by')
        .leftJoin('user_profiles as updater', 'updater.user_id', 'c.updated_by')
        .where('c.institution_id', '=', institutionId)
        .select([
            'c.course_id',
            'c.code',
            'c.title',
            'c.department_id',
            'c.description',
            'c.created_at',
            'c.created_by',
            'c.updated_at',
            'c.updated_by',
            'creator.first_name as creator_first_name',
            'creator.last_name as creator_last_name',
            'updater.first_name as updater_first_name',
            'updater.last_name as updater_last_name',
        ])
        .orderBy('c.title', 'asc')
        .execute();

    return records;
}

export type GetCoursesDataResponse = Awaited<ReturnType<typeof getCoursesData>>;
