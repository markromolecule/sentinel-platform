import { type DbClient, type DB } from '@sentinel/db';
import { type Insertable } from 'kysely';

export type CreateQuestionDataArgs = {
    dbClient: DbClient;
    values: Insertable<DB['question_bank_questions']>;
};

export async function createQuestionData({ dbClient, values }: CreateQuestionDataArgs) {
    return await dbClient
        .insertInto('question_bank_questions')
        .values(values)
        .returningAll()
        .executeTakeFirstOrThrow();
}
