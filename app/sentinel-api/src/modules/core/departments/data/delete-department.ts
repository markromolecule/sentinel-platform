import { type DbClient } from '@sentinel/db';

// Type for deleteDepartmentData function arguments
export type DeleteDepartmentDataArgs = {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
};

export async function deleteDepartmentData({
    dbClient,
    id,
    institutionId,
}: DeleteDepartmentDataArgs) {
    let query = dbClient.deleteFrom('departments').where('department_id', '=', id);

    if (institutionId) {
        query = query.where('institution_id', '=', institutionId);
    }

    const deletedRecord = await query
        .returningAll()
        .executeTakeFirstOrThrow();

    return deletedRecord;
}

export type DeleteDepartmentDataResponse = Awaited<ReturnType<typeof deleteDepartmentData>>;
