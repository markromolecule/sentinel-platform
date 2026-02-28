import { type DbClient } from '@/lib/create-db-client';

// Type for deleteDepartmentData function arguments
export type DeleteDepartmentDataArgs = {
    dbClient: DbClient;
    id: string;
};

export async function deleteDepartmentData({ dbClient, id }: DeleteDepartmentDataArgs) {
    // Delete a department record from the departments table
    const deletedRecord = await dbClient
        .deleteFrom('departments')
        .where('department_id', '=', id)
        .returningAll()
        .executeTakeFirstOrThrow();

    return deletedRecord;
}

export type DeleteDepartmentDataResponse = Awaited<ReturnType<typeof deleteDepartmentData>>;
