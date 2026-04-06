import { type DbClient } from '@sentinel/db';
import type { DB } from '@sentinel/db';
import { type Updateable } from 'kysely';

// Type for updateSemesterData function arguments
export type UpdateSemesterDataArgs = {
    dbClient: DbClient;
    id: string;
    values: Updateable<DB['terms']>;
    institutionId?: string;
};

// Update a semester record in the terms table
export async function updateSemesterData({
    dbClient,
    id,
    values,
    institutionId,
}: UpdateSemesterDataArgs) {
    let query = dbClient.updateTable('terms').set(values).where('term_id', '=', id);

    if (institutionId) {
        query = query.where((eb) =>
            eb.or([eb('institution_id', '=', institutionId), eb('institution_id', 'is', null)]),
        );
    }

    const updatedRecord = await query.returningAll().executeTakeFirstOrThrow();

    return updatedRecord;
}

export type UpdateSemesterDataResponse = Awaited<ReturnType<typeof updateSemesterData>>;
