import { type DbClient, type DB } from '@sentinel/db';
import { type Updateable } from 'kysely';

export type UpdateQuestionBankCollectionDataArgs = {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
    values: Updateable<DB['question_bank_collections']>;
};

export async function updateQuestionBankCollectionData({
    dbClient,
    id,
    institutionId,
    values,
}: UpdateQuestionBankCollectionDataArgs) {
    let query = dbClient
        .updateTable('question_bank_collections')
        .set(values)
        .where('collection_id', '=', id)
        .returningAll();

    if (institutionId) {
        query = query.where('institution_id', '=', institutionId);
    }

    return await query.executeTakeFirst();
}
