import { type DbClient, type DB } from '@sentinel/db';
import { type Insertable } from 'kysely';

export type CreateStudentWhitelistDataArgs = {
    dbClient: DbClient;
    values: Insertable<DB['student_whitelist']>;
};

export async function createStudentWhitelistData({
    dbClient,
    values,
}: CreateStudentWhitelistDataArgs) {
    return await dbClient
        .insertInto('student_whitelist')
        .values(values)
        .returningAll()
        .executeTakeFirstOrThrow();
}

