import { type DbClient } from '@sentinel/db';
import { ALL_PERMISSIONS } from '@sentinel/shared/constants';

function normalizePermissionKey(key: string) {
    return key.trim().toLowerCase();
}

export async function syncSystemPermissions(dbClient: DbClient) {
    if (ALL_PERMISSIONS.length === 0) {
        return;
    }

    await dbClient
        .insertInto('rbac_permissions')
        .values(
            ALL_PERMISSIONS.map((permission) => ({
                permission_key: normalizePermissionKey(permission.id),
                module_key: permission.moduleKey.trim().toLowerCase(),
                action_key: permission.actionKey.trim().toLowerCase(),
                category: permission.category,
                scope: permission.scope,
                name: permission.name,
                description: permission.description,
                is_system: true,
            })),
        )
        .onConflict((oc) =>
            oc.column('permission_key').doUpdateSet({
                module_key: (eb) => eb.ref('excluded.module_key'),
                action_key: (eb) => eb.ref('excluded.action_key'),
                category: (eb) => eb.ref('excluded.category'),
                scope: (eb) => eb.ref('excluded.scope'),
                name: (eb) => eb.ref('excluded.name'),
                description: (eb) => eb.ref('excluded.description'),
                is_system: true,
                updated_at: new Date(),
            }),
        )
        .execute();
}
