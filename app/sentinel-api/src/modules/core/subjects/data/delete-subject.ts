import { type DbClient } from '@sentinel/db';

export type DeleteSubjectDataArgs = {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
};

export async function deleteSubjectData({ dbClient, id, institutionId }: DeleteSubjectDataArgs) {
    let query = dbClient
        .deleteFrom('subjects')
        .where('subject_id', '=', id)
        .returning('subject_id');

    if (institutionId) {
        query = query.where((eb) =>
            eb.or([eb('institution_id', '=', institutionId), eb('institution_id', 'is', null)]),
        );
    }

    await query.executeTakeFirstOrThrow();
}
