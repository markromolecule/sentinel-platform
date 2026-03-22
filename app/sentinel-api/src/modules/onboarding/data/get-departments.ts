import { DbClient } from '@sentinel/db';

export type GetDepartmentsDataArgs = {
    dbClient: DbClient;
    institutionId?: string;
};

export async function getDepartmentsData({ dbClient, institutionId }: GetDepartmentsDataArgs) {
    let query = dbClient.selectFrom('departments').selectAll().orderBy('department_name', 'asc');

    if (institutionId) {
        query = query.where('institution_id', '=', institutionId);
    }

    const departments = await query.execute();

    return departments;
}

export type GetDepartmentsDataResponse = Awaited<ReturnType<typeof getDepartmentsData>>;
