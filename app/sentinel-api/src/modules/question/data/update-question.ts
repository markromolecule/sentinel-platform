import { type DbClient, type DB } from '@sentinel/db';
import { type Updateable } from 'kysely';

export type UpdateQuestionDataArgs = {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
    values: Updateable<DB['question_bank_questions']>;
};

export async function updateQuestionData({
    dbClient,
    id,
    institutionId,
    values,
}: UpdateQuestionDataArgs) {
    let query = dbClient
        .updateTable('question_bank_questions')
        .set(values)
        .where('question_bank_question_id', '=', id)
        .where('archived_at', 'is', null)
        .returningAll();

    if (institutionId) {
        query = query.where('institution_id', '=', institutionId);
    }

    return await query.executeTakeFirst();
}
