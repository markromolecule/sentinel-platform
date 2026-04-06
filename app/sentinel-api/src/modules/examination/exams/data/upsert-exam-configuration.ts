import { type DbClient, type DB } from '@sentinel/db';
import { type Insertable, type Updateable } from 'kysely';

export type UpsertExamConfigurationDataArgs = {
    dbClient: DbClient;
    examId: string;
    createValues: Insertable<DB['exam_configurations']>;
    updateValues: Updateable<DB['exam_configurations']>;
};

export async function upsertExamConfigurationData({
    dbClient,
    examId,
    createValues,
    updateValues,
}: UpsertExamConfigurationDataArgs) {
    const existing = await dbClient
        .selectFrom('exam_configurations')
        .select('config_id')
        .where('exam_id', '=', examId)
        .executeTakeFirst();

    if (!existing) {
        return await dbClient
            .insertInto('exam_configurations')
            .values(createValues)
            .returningAll()
            .executeTakeFirstOrThrow();
    }

    return await dbClient
        .updateTable('exam_configurations')
        .set(updateValues)
        .where('exam_id', '=', examId)
        .returningAll()
        .executeTakeFirstOrThrow();
}
