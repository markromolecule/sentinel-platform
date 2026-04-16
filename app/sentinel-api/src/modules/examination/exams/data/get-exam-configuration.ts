import { type DbClient } from '@sentinel/db';

export type GetExamConfigurationDataArgs = {
    dbClient: DbClient;
    examId: string;
};

export async function getExamConfigurationData({ dbClient, examId }: GetExamConfigurationDataArgs) {
    return await dbClient
        .selectFrom('exam_configurations')
        .selectAll()
        .where('exam_id', '=', examId)
        .executeTakeFirst();
}
