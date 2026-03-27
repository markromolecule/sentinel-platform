import { type DbClient } from '@sentinel/db';

// Type for getDepartmentsData function arguments
export type GetDepartmentsDataArgs = {
    dbClient: DbClient;
    institutionId: string;
    search?: string;
};

// Get all departments from the departments table
export async function getDepartmentsData({
    dbClient,
    institutionId,
    search,
}: GetDepartmentsDataArgs) {
    let query = dbClient
        .selectFrom('departments as dept')
        .leftJoin('user_profiles as creator', 'creator.user_id', 'dept.created_by')
        .leftJoin('user_profiles as updater', 'updater.user_id', 'dept.updated_by')
        .select([
            'dept.department_id',
            'dept.department_name',
            'dept.department_code',
            'dept.created_at',
            'dept.created_by',
            'dept.updated_at',
            'dept.updated_by',
            'creator.first_name as creator_first_name',
            'creator.last_name as creator_last_name',
            'updater.first_name as updater_first_name',
            'updater.last_name as updater_last_name',
        ]);

    if (institutionId) {
        query = query.where('dept.institution_id', '=', institutionId);
    }

    if (search) {
        query = query.where((eb) =>
            eb.or([
                eb('dept.department_name', 'ilike', `%${search}%`),
                eb('dept.department_code', 'ilike', `%${search}%`),
            ]),
        );
    }

    const records = await query.orderBy('dept.department_name', 'asc').execute();

    return records;
}

export type GetDepartmentsDataResponse = Awaited<ReturnType<typeof getDepartmentsData>>;
