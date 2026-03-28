import { type DbClient } from '@sentinel/db';

import { HTTPException } from 'hono/http-exception';

export type DeleteUserDataArgs = {
    dbClient: DbClient;
    id: string;
};

export async function deleteUserData({ dbClient, id }: DeleteUserDataArgs) {
    // 0. Prevent deleting superadmin accounts
    const targetUser = await dbClient
        .selectFrom('user_roles as ur')
        .innerJoin('roles as r', 'r.role_id', 'ur.role_id')
        .where('ur.user_id', '=', id)
        .select('r.role_name')
        .executeTakeFirst();

    if (targetUser?.role_name === 'superadmin') {
        throw new HTTPException(403, { message: 'Forbidden: Cannot delete superadmin account' });
    }

    // Explicitly delete from dependent tables to ensure no orphans
    // regardless of database level cascade configurations.

    // 1. Delete from students
    await dbClient.deleteFrom('students').where('user_id', '=', id).execute();

    // 2. Delete from instructors
    await dbClient.deleteFrom('instructors').where('user_id', '=', id).execute();

    // 3. Delete from user_roles
    await dbClient.deleteFrom('user_roles').where('user_id', '=', id).execute();

    // 4. Delete from user_profiles
    await dbClient.deleteFrom('user_profiles').where('user_id', '=', id).execute();

    return null;
}
