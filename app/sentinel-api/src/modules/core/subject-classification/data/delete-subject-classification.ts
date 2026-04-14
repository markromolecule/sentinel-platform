import { type DbClient } from '@sentinel/db';

export type DeleteSubjectClassificationDataArgs = {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
};

export async function deleteSubjectClassificationData({
    dbClient,
    id,
    institutionId,
}: DeleteSubjectClassificationDataArgs) {
    let query = dbClient
        .deleteFrom('subject_classifications')
        .where('subject_classification_id', '=', id);

    if (institutionId) {
        query = query.where('institution_id', '=', institutionId);
    }

    return await query.returningAll().executeTakeFirstOrThrow();
}
