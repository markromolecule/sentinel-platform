import { type DbClient, type DB } from '@sentinel/db';
import { type Insertable } from 'kysely';

export type CreateQuestionCollectionDataArgs = {
    dbClient: DbClient;
    values: Insertable<DB['question_bank_collections']>;
};

export async function createQuestionCollectionData({
    dbClient,
    values,
}: CreateQuestionCollectionDataArgs) {
    return await dbClient
        .insertInto('question_bank_collections')
        .values(values)
        .returningAll()
        .executeTakeFirstOrThrow();
}
