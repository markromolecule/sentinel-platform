import { DbClient } from '../../lib/create-db-client';

export type DeleteDepartmentDataArgs = {
    dbClient: DbClient;
    id: string;
};

export async function deleteDepartmentData({ dbClient, id }: DeleteDepartmentDataArgs) {
    const deletedRecord = await dbClient
        .deleteFrom('departments')
        .where('department_id', '=', id)
        .returningAll()
        .executeTakeFirstOrThrow();

    return deletedRecord;
}

export type DeleteDepartmentDataResponse = Awaited<ReturnType<typeof deleteDepartmentData>>;
