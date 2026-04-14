import { type DbClient, type DB } from '@sentinel/db';
import { type Updateable } from 'kysely';

export type UpdateSubjectClassificationDataArgs = {
    dbClient: DbClient;
    id: string;
    values: Updateable<DB['subject_classifications']>;
    institutionId?: string;
};

export async function updateSubjectClassificationData({
    dbClient,
    id,
    values,
    institutionId,
}: UpdateSubjectClassificationDataArgs) {
    let query = dbClient
        .updateTable('subject_classifications')
        .set(values)
        .where('subject_classification_id', '=', id);

    if (institutionId) {
        query = query.where('institution_id', '=', institutionId);
    }

    return await query.returningAll().executeTakeFirstOrThrow();
}

