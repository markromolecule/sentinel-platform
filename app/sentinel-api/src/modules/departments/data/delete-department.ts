import { type DbClient } from '@sentinel/db';

// Type for deleteDepartmentData function arguments
export type DeleteDepartmentDataArgs = {
    dbClient: DbClient;
    id: string;
    institutionId: string;
};

export async function deleteDepartmentData({
    dbClient,
    id,
    institutionId,
}: DeleteDepartmentDataArgs) {
    // Delete a department record from the departments table
    const deletedRecord = await dbClient
        .deleteFrom('departments')
        .where('department_id', '=', id)
        .where('institution_id', '=', institutionId)
        .returningAll()
        .executeTakeFirstOrThrow();

    return deletedRecord;
}

export type DeleteDepartmentDataResponse = Awaited<ReturnType<typeof deleteDepartmentData>>;
