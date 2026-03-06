import { type DbClient } from '@/lib/create-db-client';
import type { DB } from '@/lib/types';
import { type Updateable } from 'kysely';

export type UpdateSectionDataArgs = {
    dbClient: DbClient;
    id: string;
    values: Updateable<DB['sections']>;
};

export async function updateSectionData({ dbClient, id, values }: UpdateSectionDataArgs) {
    const updatedRecord = await dbClient
        .updateTable('sections')
        .set(values)
        .where('section_id', '=', id)
        .returningAll()
        .executeTakeFirstOrThrow();

    return updatedRecord;
}

export type UpdateSectionDataResponse = Awaited<ReturnType<typeof updateSectionData>>;
