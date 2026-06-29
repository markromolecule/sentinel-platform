import { type DbClient, executeTransaction } from '@sentinel/db';
import { getRoleRecord } from './get-role-record.service';
import { readRoles } from './get-roles.service';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';

/**
 * Replaces the access permissions mapped to a specific role ID.
 */
export async function replaceRolePermissions(
    dbClient: DbClient,
    roleId: number,
    permissionIds: string[],
    actorUserId?: string,
    institutionId?: string,
) {
    const role = await getRoleRecord(dbClient, roleId);

    const normalizedPermissionIds = Array.from(new Set(permissionIds));

    await executeTransaction(async (trx) => {
        await trx.deleteFrom('rbac_role_permissions').where('role_id', '=', roleId).execute();

        if (normalizedPermissionIds.length > 0) {
            await trx
                .insertInto('rbac_role_permissions')
                .values(
                    normalizedPermissionIds.map((permissionId) => ({
                        role_id: roleId,
                        permission_id: permissionId,
                    })),
                )
                .execute();
        }
    });

    const roles = await readRoles(dbClient);
    const updatedRole = roles.find((item) => item.id === roleId)!;

    if (actorUserId && institutionId) {
        await ActivityNotificationService.notifyGenericInstitutionActivity({
            dbClient,
            actorUserId,
            institutionId,
            operation: 'TRANSACTION_COMPLETED',
            targetType: 'ROLE_PERMISSION_ASSIGNMENT',
            targetId: String(roleId),
            targetLabel: role.role_name,
            title: 'Role permissions updated',
            message: `Access-control permissions were replaced for role "${role.role_name}".`,
            sourceModule: 'roles',
            sourceAction: 'replace-permissions',
            metadata: {
                roleId,
                permissionIds: normalizedPermissionIds,
            },
        });
    }

    return updatedRole;
}
