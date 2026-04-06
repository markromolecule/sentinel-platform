import { type DbClient } from '@sentinel/db';

export type GetExamSectionsDataArgs = {
    dbClient: DbClient;
    examId: string;
};

export async function getExamSectionsData({ dbClient, examId }: GetExamSectionsDataArgs) {
    return await dbClient
        .selectFrom('exam_sections')
        .selectAll()
        .where('exam_id', '=', examId)
        .orderBy('order_index', 'asc')
        .execute();
}
