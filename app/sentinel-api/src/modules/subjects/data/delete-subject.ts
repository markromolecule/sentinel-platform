import { type DbClient } from '@sentinel/db';

export type DeleteSubjectDataArgs = {
    dbClient: DbClient;
    id: string;
};

export async function deleteSubjectData({ dbClient, id }: DeleteSubjectDataArgs) {
    await dbClient.deleteFrom('subjects').where('subject_id', '=', id).executeTakeFirstOrThrow();
}
