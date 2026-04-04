import { type DbClient, type DB } from '@sentinel/db';
import { type Insertable } from 'kysely';

export type CreateQuestionsDataArgs = {
    dbClient: DbClient;
    values: Insertable<DB['question_bank_questions']>[];
};

export async function createQuestionsData({ dbClient, values }: CreateQuestionsDataArgs) {
    if (values.length === 0) {
        return [];
    }

    return await dbClient
        .insertInto('question_bank_questions')
        .values(values)
        .returning(['question_bank_question_id'])
        .execute();
}
