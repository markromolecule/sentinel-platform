import { type DbClient } from '@sentinel/db';
import { SYSTEM_ROLE_BLUEPRINTS } from '@sentinel/shared/constants';

/**
 * Resolves the permission sync mode for a system role based on whether the next permissions match its blueprint.
 */
export async function resolveRolePermissionSyncMode(
    dbClient: DbClient,
    role: { is_system: boolean | null; role_name: string },
    nextPermissionIds: string[],
): Promise<'BLUEPRINT' | 'CUSTOM'> {
    if (!role.is_system) {
        return 'CUSTOM';
    }

    const blueprint = SYSTEM_ROLE_BLUEPRINTS[role.role_name];
    if (!blueprint) {
        return 'CUSTOM';
    }

    const blueprintPermissions = await dbClient
        .selectFrom('rbac_permissions')
        .select('permission_id')
        .where('permission_key', 'in', blueprint.permissionKeys)
        .execute();

    const blueprintPermissionIds = blueprintPermissions.map((p) => p.permission_id);

    if (blueprintPermissionIds.length !== nextPermissionIds.length) {
        return 'CUSTOM';
    }

    const nextSet = new Set(nextPermissionIds);
    const allMatch = blueprintPermissionIds.every((id) => nextSet.has(id));

    return allMatch ? 'BLUEPRINT' : 'CUSTOM';
}
