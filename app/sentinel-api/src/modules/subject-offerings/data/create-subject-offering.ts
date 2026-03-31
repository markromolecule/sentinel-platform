import { type DbClient, type DB } from '@sentinel/db';
import { type Insertable } from 'kysely';

export type CreateSubjectOfferingDataArgs = {
    dbClient: DbClient;
    values: Insertable<DB['subject_offerings']>;
};

export async function createSubjectOfferingData({
    dbClient,
    values,
}: CreateSubjectOfferingDataArgs) {
    return await dbClient
        .insertInto('subject_offerings')
        .values({
            ...values,
            created_at: values.created_at ?? new Date(),
            updated_at: values.updated_at ?? new Date(),
        })
        .returningAll()
        .executeTakeFirstOrThrow();
}
