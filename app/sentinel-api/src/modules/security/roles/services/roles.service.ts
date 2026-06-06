import { type DbClient, executeTransaction } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import type { AccessControlRole, AccessControlRoleInput } from '@sentinel/shared/types';
import { syncSystemPermissions } from '../../permission/data/sync-system-permissions';
import { RolesRepository } from '../roles.repository';
import { syncSystemRoles } from '../data/sync-system-roles';
import { syncSystemRolePermissions } from '../data/sync-system-role-permissions';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';
import { parseCount, parseUuidArray, toNullableDate } from '../data/get-roles';

function normalizeRoleName(name: string) {
    return name.trim().toLowerCase().replace(/\s+/g, '_');
}

function mapRoleRow(row: any): AccessControlRole {
    return {
        id: row.role_id,
        name: row.role_name,
        slug: row.slug ?? null,
        description: row.description,
        isSystem: Boolean(row.is_system),
        domainScope: row.domain_scope ?? [],
        isActive: Boolean(row.is_active),
        assignableBy: row.assignable_by ?? [],
        permissionIds: parseUuidArray(row.permissionIds),
        permissionCount: parseCount(row.permissionCount),
        assignmentCount: parseCount(row.assignmentCount),
        createdAt: toNullableDate(row.created_at),
        updatedAt: toNullableDate(row.updated_at),
    };
}

/**
 * Service layer for Access Control Roles.
 * Implements Option A Business Logic and delegates to RolesRepository.
 */
export class RolesService {
    static async syncSystemRoles(dbClient: DbClient) {
        await syncSystemPermissions(dbClient);
        await syncSystemRoles(dbClient);
        await syncSystemRolePermissions(dbClient);
    }

    static async getRoleRecord(dbClient: DbClient, roleId: number) {
        const record = await RolesRepository.findRoleById(dbClient, roleId);
        if (!record) {
            throw new HTTPException(404, { message: 'Role not found.' });
        }
        return record;
    }

    static async getRoles(dbClient: DbClient, search?: string): Promise<AccessControlRole[]> {
        await this.syncSystemRoles(dbClient);
        const roles = await RolesRepository.findAllRoles(dbClient, search);
        return roles.map(mapRoleRow);
    }

    /**
     * Enforce Option A validation rules based on caller's identity roles.
     */
    private static async validateOptionABoundaries(
        dbClient: DbClient,
        actorUserId: string,
        domainScope: string[],
        isCreatingSystemRole: boolean = false,
    ) {
        // Find all roles of the actor
        const callerRoles = await dbClient
            .selectFrom('user_roles')
            .innerJoin('roles', 'roles.role_id', 'user_roles.role_id')
            .select('roles.slug')
            .where('user_roles.user_id', '=', actorUserId)
            .execute();

        const slugs = callerRoles.map((r) => r.slug).filter(Boolean) as string[];

        const isSupport = slugs.includes('support') || slugs.includes('superadmin');

        if (!isSupport) {
            // Under Option A, standard admins can only manage roles with 'app' domain scope
            const hasForbiddenScope = domainScope.some((scope) => scope !== 'app');
            if (hasForbiddenScope) {
                throw new HTTPException(403, {
                    message:
                        'Administrators are only allowed to manage roles within the app domain scope.',
                });
            }

            if (isCreatingSystemRole) {
                throw new HTTPException(403, {
                    message: 'Administrators cannot create or modify system-level roles.',
                });
            }
        }
    }

    static async createRole(
        dbClient: DbClient,
        payload: AccessControlRoleInput,
        actorUserId?: string,
        institutionId?: string,
    ) {
        const roleName = normalizeRoleName(payload.name);
        const derivedSlug = payload.slug
            ? normalizeRoleName(payload.slug)
            : normalizeRoleName(payload.name);

        // Check dynamic slug collisions
        const existing = await RolesRepository.findRoleBySlug(dbClient, derivedSlug);
        if (existing) {
            throw new HTTPException(400, {
                message: `A role with slug "${derivedSlug}" already exists.`,
            });
        }

        // Validate Option A limits if caller is specified
        if (actorUserId) {
            await this.validateOptionABoundaries(dbClient, actorUserId, payload.domainScope);
        }

        const created = await RolesRepository.createRole(dbClient, {
            name: roleName,
            slug: derivedSlug,
            description: payload.description?.trim() || null,
            domain_scope: payload.domainScope,
            is_active: payload.isActive ?? true,
            assignable_by: payload.assignableBy ?? [],
            is_system: false,
        });

        const roles = await this.getRoles(dbClient);
        const role = roles.find((r) => r.id === created.role_id)!;

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
        const roleRecord = await this.getRoleRecord(dbClient, roleId);

        // Prevent updating system-seeded roles
        if (roleRecord.is_system) {
            throw new HTTPException(400, {
                message: 'System roles cannot be modified.',
            });
        }

        const nextName = payload.name ? normalizeRoleName(payload.name) : roleRecord.role_name;
        const nextSlug = payload.slug ? normalizeRoleName(payload.slug) : roleRecord.slug;

        // Check dynamic slug collisions if slug is updated
        if (nextSlug && nextSlug !== roleRecord.slug) {
            const existing = await RolesRepository.findRoleBySlug(dbClient, nextSlug);
            if (existing) {
                throw new HTTPException(400, {
                    message: `A role with slug "${nextSlug}" already exists.`,
                });
            }
        }

        const nextDomainScope = payload.domainScope ?? roleRecord.domain_scope ?? [];

        // Validate Option A limits if caller is specified
        if (actorUserId) {
            await this.validateOptionABoundaries(dbClient, actorUserId, nextDomainScope);
        }

        await RolesRepository.updateRole(dbClient, roleId, {
            name: nextName,
            slug: nextSlug,
            description:
                payload.description !== undefined
                    ? payload.description?.trim() || null
                    : roleRecord.description,
            domain_scope: nextDomainScope,
            is_active:
                payload.isActive !== undefined ? payload.isActive : (roleRecord.is_active ?? true),
            assignable_by: payload.assignableBy ?? roleRecord.assignable_by ?? [],
        });

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
        const roleRecord = await this.getRoleRecord(dbClient, roleId);

        // Prevent deleting system-seeded roles
        if (roleRecord.is_system) {
            throw new HTTPException(400, { message: 'System roles cannot be deleted.' });
        }

        // Validate Option A limits if caller is specified
        if (actorUserId) {
            await this.validateOptionABoundaries(
                dbClient,
                actorUserId,
                roleRecord.domain_scope ?? [],
                true, // system-level role modification block
            );
        }

        await RolesRepository.deleteRole(dbClient, roleId);

        if (actorUserId && institutionId) {
            await ActivityNotificationService.notifyGenericInstitutionActivity({
                dbClient,
                actorUserId,
                institutionId,
                operation: 'DELETED',
                targetType: 'ROLE',
                targetId: String(roleId),
                targetLabel: roleRecord.role_name,
                title: 'Role deleted',
                message: `An access-control role was deleted: "${roleRecord.role_name}".`,
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
        const role = await this.getRoleRecord(dbClient, roleId);

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
