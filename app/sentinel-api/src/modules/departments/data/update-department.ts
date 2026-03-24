import { type DbClient } from '@sentinel/db';
import type { DB } from '@sentinel/db';
import { type Updateable } from 'kysely';

// Type for updateDepartmentData function arguments
export type UpdateDepartmentDataArgs = {
    dbClient: DbClient;
    id: string;
    values: Updateable<DB['departments']>;
    institutionId: string;
};

// Update a department record in the departments table
export async function updateDepartmentData({
    dbClient,
    id,
    values,
    institutionId,
}: UpdateDepartmentDataArgs) {
    const updatedRecord = await dbClient
        .updateTable('departments')
        .set(values)
        .where('department_id', '=', id)
        .where('institution_id', '=', institutionId)
        .returningAll()
        .executeTakeFirstOrThrow();

    return updatedRecord;
}

export type UpdateDepartmentDataResponse = Awaited<ReturnType<typeof updateDepartmentData>>;
