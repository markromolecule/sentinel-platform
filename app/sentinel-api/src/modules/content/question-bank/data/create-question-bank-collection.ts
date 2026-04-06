import { type DbClient, type DB } from '@sentinel/db';
import { type Insertable } from 'kysely';

export type CreateQuestionBankCollectionDataArgs = {
    dbClient: DbClient;
    values: Insertable<DB['question_bank_collections']>;
};

export async function createQuestionBankCollectionData({
    dbClient,
    values,
}: CreateQuestionBankCollectionDataArgs) {
    return await dbClient
        .insertInto('question_bank_collections')
        .values(values)
        .returningAll()
        .executeTakeFirstOrThrow();
}
