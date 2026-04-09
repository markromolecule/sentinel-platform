import { type DbClient } from '@sentinel/db';

export async function getAuthUserById(dbClient: DbClient, userId: string) {
    return dbClient
        .selectFrom('auth.users')
        .select(['id'])
        .where('id', '=', userId)
        .executeTakeFirst();
}
