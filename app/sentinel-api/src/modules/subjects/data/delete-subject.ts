import { type DbClient } from '@/lib/create-db-client';

export type DeleteSubjectDataArgs = {
    dbClient: DbClient;
    id: string;
};

export async function deleteSubjectData({ dbClient, id }: DeleteSubjectDataArgs) {
    await dbClient.deleteFrom('subjects').where('subject_id', '=', id).executeTakeFirstOrThrow();
}
