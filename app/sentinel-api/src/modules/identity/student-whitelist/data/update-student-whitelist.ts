import { type DbClient, type DB } from '@sentinel/db';
import { sql, type Updateable } from 'kysely';

export type UpdateStudentWhitelistDataArgs = {
    dbClient: DbClient;
    id: string;
    values: Updateable<DB['student_whitelist']>;
};

export async function updateStudentWhitelistData({
    dbClient,
    id,
    values,
}: UpdateStudentWhitelistDataArgs) {
    return await dbClient
        .updateTable('student_whitelist')
        .set({
            ...values,
            updated_at: sql`NOW()`,
        })
        .where('whitelist_id', '=', id)
        .returningAll()
        .executeTakeFirst();
}
