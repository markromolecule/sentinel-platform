import { type DbClient } from '@/lib/create-db-client';

// Type for getDepartmentsData function arguments
export type GetDepartmentsDataArgs = {
    dbClient: DbClient;
};

// Get all departments from the departments table
export async function getDepartmentsData({ dbClient }: GetDepartmentsDataArgs) {
    const records = await dbClient
        .selectFrom('departments')
        .selectAll()
        .orderBy('department_name', 'asc')
        .execute();

    return records;
}

export type GetDepartmentsDataResponse = Awaited<ReturnType<typeof getDepartmentsData>>;
