import { type DbClient, type DB } from '@sentinel/db';
import { type Insertable } from 'kysely';

// Type for createSemesterData function arguments
export type CreateSemesterDataArgs = {
    dbClient: DbClient;
    values: Insertable<DB['terms']>;
};

export async function createSemesterData({ dbClient, values }: CreateSemesterDataArgs) {
    // Insert a new semester record into the terms table
    const createdRecord = await dbClient
        .insertInto('terms')
        .values({
            ...values,
            created_at: values.created_at ?? new Date(),
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    return createdRecord;
}

export type CreateSemesterDataResponse = Awaited<ReturnType<typeof createSemesterData>>;
