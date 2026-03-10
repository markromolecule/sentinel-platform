import { type DbClient } from '@sentinel/db';
import type { DB } from '@sentinel/db';
import { type Insertable } from 'kysely';

export type CreateSectionDataArgs = {
    dbClient: DbClient;
    values: Insertable<DB['sections']>;
};

export async function createSectionData({ dbClient, values }: CreateSectionDataArgs) {
    const createdRecord = await dbClient
        .insertInto('sections')
        .values({
            ...values,
            created_at: values.created_at ?? new Date(),
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    return createdRecord;
}

export type CreateSectionDataResponse = Awaited<ReturnType<typeof createSectionData>>;
