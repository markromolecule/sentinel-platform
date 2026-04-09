import { type DbClient, executeTransaction } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import type { AccessControlRole, AccessControlRoleInput } from '@sentinel/shared/types';
import { syncSystemPermissions } from '../../permission/data/sync-system-permissions';
import { getRoleRecord } from '../data/get-role-record';
import { getRolesData, parseCount, parseUuidArray, toNullableDate } from '../data/get-roles';
import { syncSystemRoles } from '../data/sync-system-roles';
import { syncSystemRolePermissions } from '../data/sync-system-role-permissions';

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

    static async getRoles(dbClient: DbClient): Promise<AccessControlRole[]> {
        await this.syncSystemRoles(dbClient);
        const roles = await getRolesData(dbClient);
        return roles.map(mapRoleRow);
    }

    static async createRole(dbClient: DbClient, payload: AccessControlRoleInput) {
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
        return roles.find((role) => role.id === created.role_id)!;
    }

    static async updateRole(
        dbClient: DbClient,
        roleId: number,
        payload: Partial<AccessControlRoleInput>,
    ) {
        const role = await getRoleRecord(dbClient, roleId);
        const nextName = payload.name ? normalizeRoleName(payload.name) : role.role_name;

        if (role.is_system && payload.name && nextName !== role.role_name) {
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
                        : role.description,
                updated_at: new Date(),
            })
            .where('role_id', '=', roleId)
            .execute();

        const roles = await this.getRoles(dbClient);
        return roles.find((item) => item.id === roleId)!;
    }

    static async deleteRole(dbClient: DbClient, roleId: number) {
        const role = await getRoleRecord(dbClient, roleId);

        if (role.is_system) {
            throw new HTTPException(400, { message: 'System roles cannot be deleted.' });
        }

        await dbClient.deleteFrom('roles').where('role_id', '=', roleId).execute();
    }

    static async replaceRolePermissions(
        dbClient: DbClient,
        roleId: number,
        permissionIds: string[],
    ) {
        await getRoleRecord(dbClient, roleId);

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
        return roles.find((item) => item.id === roleId)!;
    }
}
