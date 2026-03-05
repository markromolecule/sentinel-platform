import { type DbClient } from '@/lib/create-db-client';

export type DeleteSectionDataArgs = {
    dbClient: DbClient;
    id: string;
};

export async function deleteSectionData({ dbClient, id }: DeleteSectionDataArgs) {
    await dbClient.deleteFrom('sections').where('section_id', '=', id).executeTakeFirstOrThrow();
}
