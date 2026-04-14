import { type DbClient, type DB } from '@sentinel/db';
import { type Insertable } from 'kysely';

export type CreateSubjectClassificationDataArgs = {
    dbClient: DbClient;
    values: Insertable<DB['subject_classifications']>;
};

export async function createSubjectClassificationData({
    dbClient,
    values,
}: CreateSubjectClassificationDataArgs) {
    return await dbClient
        .insertInto('subject_classifications')
        .values({
            ...values,
            created_at: values.created_at ?? new Date(),
        })
        .returningAll()
        .executeTakeFirstOrThrow();
}

