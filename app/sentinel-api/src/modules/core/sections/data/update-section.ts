import { type DbClient } from '@sentinel/db';
import { type Updateable } from 'kysely';
import { type DB } from '@sentinel/db';

export type UpdateSectionDataArgs = {
    dbClient: DbClient;
    id: string;
    values: Updateable<DB['sections']>;
    institutionId?: string;
};

export async function updateSectionData({
    dbClient,
    id,
    values,
    institutionId,
}: UpdateSectionDataArgs) {
    let query = dbClient.updateTable('sections').set(values).where('section_id', '=', id);

    if (institutionId) {
        query = query.where((eb) =>
            eb.or([eb('institution_id', '=', institutionId), eb('institution_id', 'is', null)]),
        );
    }

    const record = await query.returningAll().executeTakeFirst();

    if (!record) {
        throw new Error('Section not found');
    }

    return record;
}

export type UpdateSectionDataResponse = Awaited<ReturnType<typeof updateSectionData>>;
