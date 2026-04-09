import { type DbClient } from '@sentinel/db';

import { HTTPException } from 'hono/http-exception';
import { resolveTargetUserRole } from './resolve-target-user-role';

export type DeleteUserDataArgs = {
    dbClient: DbClient;
    id: string;
    requesterRole?: string;
    requesterUserId?: string;
};

export async function deleteUserData({
    dbClient,
    id,
    requesterRole,
    requesterUserId,
}: DeleteUserDataArgs) {
    const targetRole = await resolveTargetUserRole(dbClient, id);

    if (
        targetRole === 'superadmin' &&
        requesterRole !== 'support' &&
        requesterRole !== 'superadmin'
    ) {
        throw new HTTPException(403, { message: 'Forbidden: Cannot delete superadmin account' });
    }

    if (requesterRole === 'support' && targetRole !== 'superadmin') {
        throw new HTTPException(403, {
            message: 'Forbidden: Support can only delete superadmin accounts',
        });
    }

    // Explicitly delete from dependent tables to ensure no orphans
    // regardless of database level cascade configurations.

    // 0. Release any claimed whitelist entries so they can be reused for onboarding later.
    await dbClient
        .updateTable('student_whitelist')
        .set({
            claimed_user_id: null,
            claimed_at: null,
            updated_at: new Date(),
            updated_by: requesterUserId ?? null,
        })
        .where('claimed_user_id', '=', id)
        .execute();

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
