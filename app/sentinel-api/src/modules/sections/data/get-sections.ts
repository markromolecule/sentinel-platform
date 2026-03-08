import { type DbClient } from '@/lib/create-db-client';

export type GetSectionsDataArgs = {
    dbClient: DbClient;
    institutionId: string;
};

export async function getSectionsData({ dbClient, institutionId }: GetSectionsDataArgs) {
    const records = await dbClient
        .selectFrom('sections as sec')
        .leftJoin('user_profiles as creator', 'creator.user_id', 'sec.created_by')
        .leftJoin('user_profiles as updater', 'updater.user_id', 'sec.updated_by')
        .where('sec.institution_id', '=', institutionId)
        .select([
            'sec.section_id',
            'sec.section_name',
            'sec.department_id',
            'sec.course_id',
            'sec.year_level',
            'sec.created_at',
            'sec.created_by',
            'sec.updated_at',
            'sec.updated_by',
            'creator.first_name as creator_first_name',
            'creator.last_name as creator_last_name',
            'updater.first_name as updater_first_name',
            'updater.last_name as updater_last_name',
        ])
        .orderBy('sec.section_name', 'asc')
        .execute();

    return records;
}

export type GetSectionsDataResponse = Awaited<ReturnType<typeof getSectionsData>>;
