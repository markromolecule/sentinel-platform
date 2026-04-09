import { type DbClient } from '@sentinel/db';

export async function getAccessControlAssignmentsData(dbClient: DbClient) {
    return dbClient
        .selectFrom('user_roles as ur')
        .innerJoin('roles as r', 'r.role_id', 'ur.role_id')
        .innerJoin('auth.users as au', 'au.id', 'ur.user_id')
        .leftJoin('user_profiles as up', 'up.user_id', 'ur.user_id')
        .select([
            'ur.user_id',
            'ur.role_id',
            'r.role_name',
            'ur.assigned_at',
            'up.first_name',
            'up.last_name',
            'au.email',
        ])
        .orderBy('ur.assigned_at', 'desc')
        .execute();
}
