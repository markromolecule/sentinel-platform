import { DbClient } from '../../lib/create-db-client';
import { Insertable } from 'kysely';
import { DB } from '../../lib/types';
import { sql } from 'kysely';

export type CreateDepartmentDataArgs = {
    dbClient: DbClient;
    values: Insertable<DB['departments']>;
};

export async function createDepartmentData({ dbClient, values }: CreateDepartmentDataArgs) {
    const createdRecord = await dbClient
        .insertInto('departments')
        .values({
            ...values,
            created_at: values.created_at || sql`NOW()`,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    return createdRecord;
}

export type CreateDepartmentDataResponse = Awaited<ReturnType<typeof createDepartmentData>>;
