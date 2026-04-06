import { type DbClient, type DB } from '@sentinel/db';
import { type Updateable } from 'kysely';

export type UpdateExamDataArgs = {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
    values: Updateable<DB['exams']>;
};

export async function updateExamData({
    dbClient,
    id,
    institutionId,
    values,
}: UpdateExamDataArgs) {
    let query = dbClient
        .updateTable('exams')
        .set(values)
        .where('exam_id', '=', id)
        .returningAll();

    if (institutionId) {
        query = query.where('institution_id', '=', institutionId);
    }

    return await query.executeTakeFirst();
}
