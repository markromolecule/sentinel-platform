import { type DbClient } from '@/lib/create-db-client';
import type { DB } from '@/lib/types';
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
