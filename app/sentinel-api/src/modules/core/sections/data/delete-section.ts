import { type DbClient } from '@sentinel/db';

export type DeleteSectionDataArgs = {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
};

export async function deleteSectionData({ dbClient, id, institutionId }: DeleteSectionDataArgs) {
    let query = dbClient.deleteFrom('sections').where('section_id', '=', id);

    if (institutionId) {
        query = query.where((eb) =>
            eb.or([eb('institution_id', '=', institutionId), eb('institution_id', 'is', null)]),
        );
    }

    const record = await query.returning(['section_id', 'section_name']).executeTakeFirst();

    if (!record) {
        throw new Error('Section not found');
    }

    return record;
}

export type DeleteSectionDataResponse = Awaited<ReturnType<typeof deleteSectionData>>;
