import { type DbClient, type DB } from '@sentinel/db';
import { type Insertable } from 'kysely';

export type ReplaceExamQuestionsDataArgs = {
    dbClient: DbClient;
    examId: string;
    questions: Insertable<DB['exam_questions']>[];
};

export async function replaceExamQuestionsData({
    dbClient,
    examId,
    questions,
}: ReplaceExamQuestionsDataArgs) {
    await dbClient.deleteFrom('exam_questions').where('exam_id', '=', examId).execute();

    if (questions.length === 0) {
        return [];
    }

    return await dbClient.insertInto('exam_questions').values(questions).returningAll().execute();
}
