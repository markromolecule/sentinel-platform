import { type DbClient } from '@sentinel/db';

export type DeleteSelectedSubjectsDataArgs = {
    dbClient: DbClient;
    ids: string[];
    institutionId?: string;
};

export async function deleteSelectedSubjectsData({
    dbClient,
    ids,
    institutionId,
}: DeleteSelectedSubjectsDataArgs) {
    let query = dbClient
        .deleteFrom('subjects')
        .where('subject_id', 'in', ids)
        .returning('subject_id');

    if (institutionId) {
        query = query.where('institution_id', '=', institutionId);
    }

    const deletedSubjects = await query.execute();

    return {
        deleted_count: deletedSubjects.length,
    };
}
