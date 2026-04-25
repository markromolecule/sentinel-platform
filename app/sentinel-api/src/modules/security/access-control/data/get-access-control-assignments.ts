import { type DbClient } from '@sentinel/db';

export async function getAccessControlAssignmentsData(dbClient: DbClient, search?: string) {
    let query = dbClient
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
        ]);

    if (search) {
        query = query.where((eb) =>
            eb.or([
                eb('r.role_name', 'ilike', `%${search}%`),
                eb('up.first_name', 'ilike', `%${search}%`),
                eb('up.last_name', 'ilike', `%${search}%`),
                eb('au.email', 'ilike', `%${search}%`),
            ]),
        );
    }

    return query.orderBy('ur.assigned_at', 'desc').execute();
}
