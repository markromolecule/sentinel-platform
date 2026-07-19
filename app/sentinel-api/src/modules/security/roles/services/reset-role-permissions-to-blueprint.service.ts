import { type DbClient, executeTransaction } from '@sentinel/db';
import { SYSTEM_ROLE_BLUEPRINTS } from '@sentinel/shared/constants';
import { HTTPException } from 'hono/http-exception';
import { getRoleRecord } from './get-role-record.service';
import { readRoles } from './get-roles.service';

/**
 * Resets a system role's permissions to its hardcoded blueprint permissions.
 */
export async function resetRolePermissionsToBlueprint(dbClient: DbClient, roleId: number) {
    const role = await getRoleRecord(dbClient, roleId);

    if (!role.is_system) {
        throw new HTTPException(400, { message: 'Only system roles can be reset to blueprints.' });
    }

    const blueprint = SYSTEM_ROLE_BLUEPRINTS[role.role_name];
    if (!blueprint) {
        throw new HTTPException(500, {
            message: `Blueprint not found for system role "${role.role_name}".`,
        });
    }

    const permissions = await dbClient
        .selectFrom('rbac_permissions')
        .select('permission_id')
        .where('permission_key', 'in', blueprint.permissionKeys)
        .execute();

    await executeTransaction(async (trx) => {
        await trx.deleteFrom('rbac_role_permissions').where('role_id', '=', roleId).execute();

        if (permissions.length > 0) {
            await trx
                .insertInto('rbac_role_permissions')
                .values(
                    permissions.map((p) => ({
                        role_id: roleId,
                        permission_id: p.permission_id,
                    })),
                )
                .execute();
        }

        await trx
            .updateTable('roles')
            .set({
                permission_sync_mode: 'BLUEPRINT',
                updated_at: new Date(),
            })
            .where('role_id', '=', roleId)
            .execute();
    });

    const roles = await readRoles(dbClient);
    const updatedRole = roles.find((item) => item.id === roleId)!;
    return updatedRole;
}
