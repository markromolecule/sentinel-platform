import { DbClient } from '../../lib/create-db-client';
import { Updateable } from 'kysely';
import { DB } from '../../lib/types';
import { sql } from 'kysely';

export type UpdateDepartmentDataArgs = {
    dbClient: DbClient;
    id: string;
    values: Updateable<DB['departments']>;
};

export async function updateDepartmentData({ dbClient, id, values }: UpdateDepartmentDataArgs) {
    const updatedRecord = await dbClient
        .updateTable('departments')
        .set({
            ...values,
        })
        .where('department_id', '=', id)
        .returningAll()
        .executeTakeFirstOrThrow();

    return updatedRecord;
}

export type UpdateDepartmentDataResponse = Awaited<ReturnType<typeof updateDepartmentData>>;
