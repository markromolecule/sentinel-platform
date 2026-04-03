import { type DbClient, type DB } from '@sentinel/db';
import { type Insertable } from 'kysely';

export type AddQuestionCollectionQuestionsDataArgs = {
    dbClient: DbClient;
    values: Insertable<DB['question_bank_collection_questions']>[];
};

export async function addQuestionCollectionQuestionsData({
    dbClient,
    values,
}: AddQuestionCollectionQuestionsDataArgs) {
    if (values.length === 0) {
        return [];
    }

    return await dbClient
        .insertInto('question_bank_collection_questions')
        .values(values)
        .returningAll()
        .execute();
}
