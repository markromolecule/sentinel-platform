import { type DbClient } from '@sentinel/db';
import type { DB } from '@sentinel/db';
import { type Updateable } from 'kysely';

export type UpdateSubjectDataArgs = {
    dbClient: DbClient;
    id: string;
    values: Updateable<DB['subjects']>;
};

export async function updateSubjectData({ dbClient, id, values }: UpdateSubjectDataArgs) {
    const updatedRecord = await dbClient
        .updateTable('subjects')
        .set(values)
        .where('subject_id', '=', id)
        .returningAll()
        .executeTakeFirstOrThrow();

    return updatedRecord;
}

export type UpdateSubjectDataResponse = Awaited<ReturnType<typeof updateSubjectData>>;
