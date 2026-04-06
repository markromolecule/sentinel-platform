import { type DB, DbClient } from '@sentinel/db';
import { type Selectable } from 'kysely';

export type GetDepartmentsDataArgs = {
    dbClient: DbClient;
    institutionId?: string;
};

export async function getDepartmentsData({
    dbClient,
    institutionId,
}: GetDepartmentsDataArgs): Promise<Selectable<DB['departments']>[]> {
    let query = dbClient.selectFrom('departments').selectAll().orderBy('department_name', 'asc');

    if (institutionId) {
        query = query.where('institution_id', '=', institutionId);
    }

    const departments = await query.execute();

    return departments;
}

export type GetDepartmentsDataResponse = Awaited<ReturnType<typeof getDepartmentsData>>;
