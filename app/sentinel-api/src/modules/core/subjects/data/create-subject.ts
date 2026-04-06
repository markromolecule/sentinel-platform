import { type DbClient } from '@sentinel/db';
import type { DB } from '@sentinel/db';
import { type Insertable } from 'kysely';
import { omitSubjectOfferingFields } from '../helper/subject-offering-compat';

export type CreateSubjectDataArgs = {
    dbClient: DbClient;
    values: Insertable<DB['subjects']>;
    includeOfferingFields?: boolean;
};

export async function createSubjectData({
    dbClient,
    values,
    includeOfferingFields = true,
}: CreateSubjectDataArgs) {
    const createdRecord = await dbClient
        .insertInto('subjects')
        .values({
            ...(includeOfferingFields ? values : omitSubjectOfferingFields(values)),
            created_at: values.created_at ?? new Date(),
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    return createdRecord;
}

export type CreateSubjectDataResponse = Awaited<ReturnType<typeof createSubjectData>>;
