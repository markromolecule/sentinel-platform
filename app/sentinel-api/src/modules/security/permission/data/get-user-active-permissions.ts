import { type DbClient } from '@sentinel/db';

/**
 * Resolves all active permissions for a user based on their assigned roles
 * and any individual permission overrides.
 */
export async function getUserActivePermissions(
    dbClient: DbClient,
    userId: string,
): Promise<string[]> {
    // 1. Fetch permissions inherited from assigned roles
    const rolePermissions = await dbClient
        .selectFrom('user_roles as ur')
        .innerJoin('rbac_role_permissions as rrp', 'rrp.role_id', 'ur.role_id')
        .innerJoin('rbac_permissions as p', 'p.permission_id', 'rrp.permission_id')
        .select('p.permission_key')
        .where('ur.user_id', '=', userId)
        .execute();

    // 2. Fetch direct user overrides (allow/deny)
    const overrides = await dbClient
        .selectFrom('rbac_user_permission_overrides as upo')
        .innerJoin('rbac_permissions as p', 'p.permission_id', 'upo.permission_id')
        .select(['p.permission_key', 'upo.effect'])
        .where('upo.user_id', '=', userId)
        .execute();

    // 3. Combine: Roles provide base permissions, overrides take precedence
    const permissions = new Set<string>(rolePermissions.map((rp) => rp.permission_key));

    for (const override of overrides) {
        if (override.effect === 'allow') {
            permissions.add(override.permission_key);
        } else {
            permissions.delete(override.permission_key);
        }
    }

    return Array.from(permissions).sort();
}
