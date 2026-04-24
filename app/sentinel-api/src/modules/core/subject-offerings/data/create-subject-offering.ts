import { type DbClient, type DB } from '@sentinel/db';
import { type Insertable } from 'kysely';

export type CreateSubjectOfferingDataArgs = {
    dbClient: DbClient;
    values: Insertable<DB['subject_offerings']>;
};

export type CreateSubjectOfferingsDataArgs = {
    dbClient: DbClient;
    values: Insertable<DB['subject_offerings']>[];
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

export async function createSubjectOfferingsData({
    dbClient,
    values,
}: CreateSubjectOfferingsDataArgs) {
    if (values.length === 0) {
        return [];
    }

    const now = new Date();

    return await dbClient
        .insertInto('subject_offerings')
        .values(
            values.map((value) => ({
                ...value,
                created_at: value.created_at ?? now,
                updated_at: value.updated_at ?? now,
            })),
        )
        .returningAll()
        .execute();
}
