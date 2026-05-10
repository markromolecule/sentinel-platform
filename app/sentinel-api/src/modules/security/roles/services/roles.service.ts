import { type DbClient, executeTransaction } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import type { AccessControlRole, AccessControlRoleInput } from '@sentinel/shared/types';
import { syncSystemPermissions } from '../../permission/data/sync-system-permissions';
import { getRoleRecord } from '../data/get-role-record';
import { getRolesData, parseCount, parseUuidArray, toNullableDate } from '../data/get-roles';
import { syncSystemRoles } from '../data/sync-system-roles';
import { syncSystemRolePermissions } from '../data/sync-system-role-permissions';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';

function normalizeRoleName(name: string) {
    return name.trim().toLowerCase().replace(/\s+/g, '_');
}

function mapRoleRow(row: {
    role_id: number;
    role_name: string;
    description: string | null;
    is_system: boolean | null;
    created_at: Date | null;
    updated_at: Date | null;
    permissionIds: string[] | null;
    permissionCount: string | number | bigint | null;
    assignmentCount: string | number | bigint | null;
}): AccessControlRole {
    return {
        id: row.role_id,
        name: row.role_name,
        description: row.description,
        isSystem: Boolean(row.is_system),
        permissionIds: parseUuidArray(row.permissionIds),
        permissionCount: parseCount(row.permissionCount),
        assignmentCount: parseCount(row.assignmentCount),
        createdAt: toNullableDate(row.created_at),
        updatedAt: toNullableDate(row.updated_at),
    };
}

export class RolesService {
    static async syncSystemRoles(dbClient: DbClient) {
        await syncSystemPermissions(dbClient);
        await syncSystemRoles(dbClient);
        await syncSystemRolePermissions(dbClient);
    }

    static async getRoleRecord(dbClient: DbClient, roleId: number) {
        return getRoleRecord(dbClient, roleId);
    }

    static async getRoles(dbClient: DbClient, search?: string): Promise<AccessControlRole[]> {
        await this.syncSystemRoles(dbClient);
        const roles = await getRolesData(dbClient, search);
        return roles.map(mapRoleRow);
    }

    static async createRole(
        dbClient: DbClient,
        payload: AccessControlRoleInput,
        actorUserId?: string,
        institutionId?: string,
    ) {
        const roleName = normalizeRoleName(payload.name);

        const created = await dbClient
            .insertInto('roles')
            .values({
                role_name: roleName,
                description: payload.description?.trim() || null,
                is_system: false,
            })
            .returning('role_id')
            .executeTakeFirstOrThrow();

        const roles = await this.getRoles(dbClient);
        const role = roles.find((role) => role.id === created.role_id)!;

        if (actorUserId && institutionId) {
            await ActivityNotificationService.notifyGenericInstitutionActivity({
                dbClient,
                actorUserId,
                institutionId,
                operation: 'CREATED',
                targetType: 'ROLE',
                targetId: String(role.id),
                targetLabel: role.name,
                title: 'Role created',
                message: `An access-control role was created: "${role.name}".`,
                sourceModule: 'roles',
                sourceAction: 'create',
                metadata: {
                    roleId: role.id,
                },
            });
        }

        return role;
    }

    static async updateRole(
        dbClient: DbClient,
        roleId: number,
        payload: Partial<AccessControlRoleInput>,
        actorUserId?: string,
        institutionId?: string,
    ) {
        const roleRecord = await getRoleRecord(dbClient, roleId);
        const nextName = payload.name ? normalizeRoleName(payload.name) : roleRecord.role_name;

        if (roleRecord.is_system && payload.name && nextName !== roleRecord.role_name) {
            throw new HTTPException(400, {
                message: 'System roles cannot be renamed.',
            });
        }

        await dbClient
            .updateTable('roles')
            .set({
                role_name: nextName,
                description:
                    payload.description !== undefined
                        ? payload.description?.trim() || null
                        : roleRecord.description,
                updated_at: new Date(),
            })
            .where('role_id', '=', roleId)
            .execute();

        const roles = await this.getRoles(dbClient);
        const role = roles.find((item) => item.id === roleId)!;

        if (actorUserId && institutionId) {
            await ActivityNotificationService.notifyGenericInstitutionActivity({
                dbClient,
                actorUserId,
                institutionId,
                operation: 'UPDATED',
                targetType: 'ROLE',
                targetId: String(role.id),
                targetLabel: role.name,
                title: 'Role updated',
                message: `An access-control role was updated: "${role.name}".`,
                sourceModule: 'roles',
                sourceAction: 'update',
                metadata: {
                    roleId: role.id,
                },
            });
        }

        return role;
    }

    static async deleteRole(
        dbClient: DbClient,
        roleId: number,
        actorUserId?: string,
        institutionId?: string,
    ) {
        const role = await getRoleRecord(dbClient, roleId);

        if (role.is_system) {
            throw new HTTPException(400, { message: 'System roles cannot be deleted.' });
        }

        await dbClient.deleteFrom('roles').where('role_id', '=', roleId).execute();

        if (actorUserId && institutionId) {
            await ActivityNotificationService.notifyGenericInstitutionActivity({
                dbClient,
                actorUserId,
                institutionId,
                operation: 'DELETED',
                targetType: 'ROLE',
                targetId: String(roleId),
                targetLabel: role.role_name,
                title: 'Role deleted',
                message: `An access-control role was deleted: "${role.role_name}".`,
                sourceModule: 'roles',
                sourceAction: 'delete',
                metadata: {
                    roleId,
                },
            });
        }
    }

    static async replaceRolePermissions(
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

        const roles = await this.getRoles(dbClient);
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
}
