import { type DbClient } from '@/lib/create-db-client';
import type { DB } from '@/lib/types';
import { type Insertable } from 'kysely';

// Type for createDepartmentData function arguments
export type CreateDepartmentDataArgs = {
    dbClient: DbClient;
    values: Insertable<DB['departments']>;
};

export async function createDepartmentData({ dbClient, values }: CreateDepartmentDataArgs) {
    // Insert a new department record into the departments table
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
