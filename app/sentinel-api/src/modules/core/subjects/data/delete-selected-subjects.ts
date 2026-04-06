import { type DbClient } from '@sentinel/db';

export type DeleteSelectedSubjectsDataArgs = {
    dbClient: DbClient;
    ids: string[];
};

export async function deleteSelectedSubjectsData({
    dbClient,
    ids,
}: DeleteSelectedSubjectsDataArgs) {
    const deletedSubjects = await dbClient
        .deleteFrom('subjects')
        .where('subject_id', 'in', ids)
        .returning('subject_id')
        .execute();

    return {
        deleted_count: deletedSubjects.length,
    };
}
