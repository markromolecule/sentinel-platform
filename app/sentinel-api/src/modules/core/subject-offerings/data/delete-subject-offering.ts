import { type DbClient } from '@sentinel/db';

export async function deleteSubjectOfferingData(
    dbClient: DbClient,
    id: string,
    institutionId?: string,
) {
    let query = dbClient.deleteFrom('subject_offerings').where('subject_offering_id', '=', id);

    if (institutionId) {
        query = query.where('institution_id', '=', institutionId);
    }

    await query.returning('subject_offering_id').executeTakeFirstOrThrow();
}
