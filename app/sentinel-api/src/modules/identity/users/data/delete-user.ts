import { type DbClient } from '@sentinel/db';

import { HTTPException } from 'hono/http-exception';
import { resolveTargetUserRole } from './resolve-target-user-role';
import { NULLABLE_USER_REFERENCE_COLUMNS } from './nullable-user-reference-columns';

export type DeleteUserDataArgs = {
    dbClient: DbClient;
    id: string;
    requesterRole?: string;
    requesterUserId?: string;
};

async function clearNullableUserReference(
    dbClient: DbClient,
    table: (typeof NULLABLE_USER_REFERENCE_COLUMNS)[number]['table'],
    column: (typeof NULLABLE_USER_REFERENCE_COLUMNS)[number]['column'],
    userId: string,
) {
    try {
        await (dbClient as any)
            .updateTable(table)
            .set({ [column]: null })
            .where(column, '=', userId)
            .execute();
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        if (
            message.includes('does not exist') ||
            message.includes('relation') ||
            message.includes('column')
        ) {
            return;
        }

        throw error;
    }
}

export async function prepareUserForAuthDeletion({
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

    // Release claimed whitelist entries first so onboarding records can be reused and so
    // auth.users no longer has active references from claimed_user_id.
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

    for (const reference of NULLABLE_USER_REFERENCE_COLUMNS) {
        await clearNullableUserReference(dbClient, reference.table, reference.column, id);
    }
}

export async function deleteUserData({
    dbClient,
    id,
    requesterRole,
    requesterUserId,
}: DeleteUserDataArgs) {
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
