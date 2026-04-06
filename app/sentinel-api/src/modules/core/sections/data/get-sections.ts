import { type DbClient } from '@sentinel/db';

export type GetSectionsDataArgs = {
    dbClient: DbClient;
    institutionId: string;
    departmentId?: string;
    courseId?: string;
    search?: string;
};

export async function getSectionsData({
    dbClient,
    institutionId,
    departmentId,
    courseId,
    search,
}: GetSectionsDataArgs) {
    let query = dbClient
        .selectFrom('sections as sec')
        .leftJoin('user_profiles as creator', 'creator.user_id', 'sec.created_by')
        .leftJoin('user_profiles as updater', 'updater.user_id', 'sec.updated_by')
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
        ]);

    if (institutionId) {
        query = query.where((eb) =>
            eb.or([
                eb('sec.institution_id', '=', institutionId),
                eb('sec.institution_id', 'is', null),
            ]),
        );
    }

    if (departmentId) {
        query = query.where('sec.department_id', '=', departmentId);
    }

    if (courseId) {
        query = query.where('sec.course_id', '=', courseId);
    }

    if (search) {
        query = query.where('sec.section_name', 'ilike', `%${search}%`);
    }

    const records = await query.orderBy('sec.section_name', 'asc').execute();

    return records;
}

export type GetSectionsDataResponse = Awaited<ReturnType<typeof getSectionsData>>;
