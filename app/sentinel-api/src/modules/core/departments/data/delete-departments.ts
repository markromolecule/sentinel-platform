import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';

export type DeleteDepartmentsDataArgs = {
    dbClient: DbClient;
    ids: string[];
    institutionId?: string;
};

export async function deleteDepartmentsData({
    dbClient,
    ids,
    institutionId,
}: DeleteDepartmentsDataArgs) {
    if (!ids || ids.length === 0) {
        throw new HTTPException(400, { message: 'No department IDs provided' });
    }

    let query = dbClient.deleteFrom('departments').where('department_id', 'in', ids);

    if (institutionId) {
        query = query.where('institution_id', '=', institutionId);
    }

    const deletedRecords = await query.returning('department_id').execute();

    if (deletedRecords.length === 0) {
        throw new HTTPException(404, { message: 'Departments not found or already deleted' });
    }

    return deletedRecords;
}
