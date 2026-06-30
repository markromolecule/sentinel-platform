import { type DbClient } from '@sentinel/db';
import { SYSTEM_ROLE_BLUEPRINTS } from '@sentinel/shared/constants';

export async function syncSystemRolePermissions(dbClient: DbClient) {
    const roleNames = Object.keys(SYSTEM_ROLE_BLUEPRINTS);
    const permissionKeys = Array.from(
        new Set(
            Object.values(SYSTEM_ROLE_BLUEPRINTS).flatMap((blueprint) => blueprint.permissionKeys),
        ),
    );

    if (roleNames.length === 0 || permissionKeys.length === 0) {
        return;
    }

    const [roles, permissions, existingMappings] = await Promise.all([
        dbClient
            .selectFrom('roles')
            .select(['role_id', 'role_name'])
            .where('role_name', 'in', roleNames)
            .execute(),
        dbClient
            .selectFrom('rbac_permissions')
            .select(['permission_id', 'permission_key'])
            .where('permission_key', 'in', permissionKeys)
            .execute(),
        dbClient
            .selectFrom('rbac_role_permissions')
            .select(['role_id', 'permission_id'])
            .execute(),
    ]);

    const roleIdByName = new Map(roles.map((role) => [role.role_name, role.role_id]));
    const permissionIdByKey = new Map(
        permissions.map((permission) => [permission.permission_key, permission.permission_id]),
    );
    const existingMappingKeys = new Set(
        existingMappings.map((mapping) => `${mapping.role_id}:${mapping.permission_id}`),
    );

    const mappings = Object.entries(SYSTEM_ROLE_BLUEPRINTS).flatMap(([roleName, blueprint]) => {
        const roleId = roleIdByName.get(roleName);

        if (!roleId) {
            return [];
        }

        return blueprint.permissionKeys
            .map((permissionKey) => permissionIdByKey.get(permissionKey))
            .filter((permissionId): permissionId is string => Boolean(permissionId))
            .filter((permissionId) => !existingMappingKeys.has(`${roleId}:${permissionId}`))
            .map((permissionId) => ({
                role_id: roleId,
                permission_id: permissionId,
            }));
    });

    if (mappings.length === 0) {
        return;
    }

    await dbClient
        .insertInto('rbac_role_permissions')
        .values(mappings)
        .onConflict((oc) => oc.columns(['role_id', 'permission_id']).doNothing())
        .execute();
}
