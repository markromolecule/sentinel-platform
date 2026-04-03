import { type DbClient } from '@sentinel/db';

export type GetExamQuestionsDataArgs = {
    dbClient: DbClient;
    examId: string;
};

export async function getExamQuestionsData({ dbClient, examId }: GetExamQuestionsDataArgs) {
    return await dbClient
        .selectFrom('exam_questions')
        .selectAll()
        .where('exam_id', '=', examId)
        .orderBy('order_index', 'asc')
        .execute();
}
