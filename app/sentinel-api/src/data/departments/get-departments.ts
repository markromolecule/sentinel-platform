import { DbClient } from '../../lib/create-db-client';

export type GetDepartmentsDataArgs = {
    dbClient: DbClient;
};

export async function getDepartmentsData({ dbClient }: GetDepartmentsDataArgs) {
    const records = await dbClient
        .selectFrom('departments')
        .selectAll()
        .orderBy('department_name', 'asc')
        .execute();

    return records;
}

export type GetDepartmentsDataResponse = Awaited<ReturnType<typeof getDepartmentsData>>;
