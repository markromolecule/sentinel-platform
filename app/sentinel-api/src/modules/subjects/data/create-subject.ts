import { type DbClient } from '@sentinel/db';
import type { DB } from '@sentinel/db';
import { type Insertable } from 'kysely';

export type CreateSubjectDataArgs = {
    dbClient: DbClient;
    values: Insertable<DB['subjects']>;
};

export async function createSubjectData({ dbClient, values }: CreateSubjectDataArgs) {
    const createdRecord = await dbClient
        .insertInto('subjects')
        .values({
            ...values,
            created_at: values.created_at ?? new Date(),
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    return createdRecord;
}

export type CreateSubjectDataResponse = Awaited<ReturnType<typeof createSubjectData>>;
