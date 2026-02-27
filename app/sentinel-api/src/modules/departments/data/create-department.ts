import { type DbClient } from '@/lib/create-db-client';
import type { DB } from '@/lib/types';
import { type Insertable } from 'kysely';

export type CreateDepartmentDataArgs = {
    dbClient: DbClient;
    values: Insertable<DB['departments']>;
};

export async function createDepartmentData({
    dbClient,
    values,
}: CreateDepartmentDataArgs) {
    const createdRecord = await dbClient
        .insertInto('departments')
        .values({
            ...values,
            created_at: values.created_at ?? new Date(),
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    return createdRecord;
}

export type CreateDepartmentDataResponse = Awaited<ReturnType<typeof createDepartmentData>>;
