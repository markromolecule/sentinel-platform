import { type DbClient, type DB } from '@sentinel/db';
import { type Updateable } from 'kysely';

export type UpdateSubjectOfferingDataArgs = {
    dbClient: DbClient;
    id: string;
    values: Updateable<DB['subject_offerings']>;
};

export async function updateSubjectOfferingData({
    dbClient,
    id,
    values,
}: UpdateSubjectOfferingDataArgs) {
    return await dbClient
        .updateTable('subject_offerings')
        .set({
            ...values,
            updated_at: values.updated_at ?? new Date(),
        })
        .where('subject_offering_id', '=', id)
        .returningAll()
        .executeTakeFirstOrThrow();
}
