import { type DbClient } from '@sentinel/db';

function getRoleFromMetadata(rawUserMetaData: unknown) {
    if (!rawUserMetaData) {
        return null;
    }

    try {
        const meta =
            typeof rawUserMetaData === 'string'
                ? JSON.parse(rawUserMetaData)
                : (rawUserMetaData as Record<string, unknown>);

        if (meta && typeof meta === 'object' && 'role' in meta) {
            const role = meta.role;
            return typeof role === 'string' ? role.toLowerCase() : null;
        }
    } catch {
        // Ignore malformed metadata and fall back to explicit DB roles.
    }

    return null;
}

export async function resolveTargetUserRole(dbClient: DbClient, userId: string) {
    const roleRows = await dbClient
        .selectFrom('auth.users as u')
        .leftJoin('user_roles as ur', 'ur.user_id', 'u.id')
        .leftJoin('roles as r', 'r.role_id', 'ur.role_id')
        .where('u.id', '=', userId)
        .select(['r.role_name', 'u.raw_user_meta_data'])
        .execute();

    const explicitRole =
        roleRows.find((row) => row.role_name === 'superadmin')?.role_name ??
        roleRows.find((row) => Boolean(row.role_name))?.role_name ??
        null;
    const metadataRole = getRoleFromMetadata(roleRows[0]?.raw_user_meta_data);

    return explicitRole ?? metadataRole;
}
