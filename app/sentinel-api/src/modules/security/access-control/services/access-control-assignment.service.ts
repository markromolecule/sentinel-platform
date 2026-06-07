import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { sql } from 'kysely';
import type { AccessControlAssignment, AccessControlAssignmentInput } from '@sentinel/shared/types';
import { resolveTargetUserRole } from '../../../identity/users/data/resolve-target-user-role';
import { UserAuthService } from '../../../identity/users/services/user-auth.service';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';
import { RolesService } from '../../roles/services/roles.service';
import { RolesRepository } from '../../roles/roles.repository';
import { getAccessControlAssignmentsData } from '../data/get-access-control-assignments';
import { getAuthUserById } from '../data/get-auth-user-by-id';
import { ensureAccessControlCatalogs } from './access-control-catalog.service';
import { LogsService } from '../../../general/logs/logs.service';

function buildDisplayName(
    firstName?: string | null,
    lastName?: string | null,
    email?: string | null,
) {
    const fullName = [firstName?.trim(), lastName?.trim()].filter(Boolean).join(' ').trim();

    return fullName || email || 'Unknown User';
}

function toNullableDate(value: Date | string | null | undefined) {
    return value ?? null;
}

export class AccessControlAssignmentService {
    static async getAssignments(
        dbClient: DbClient,
        search?: string,
    ): Promise<AccessControlAssignment[]> {
        await ensureAccessControlCatalogs(dbClient);

        const assignments = await getAccessControlAssignmentsData(dbClient, search);

        return assignments.map((assignment) => ({
            userId: assignment.user_id,
            roleId: assignment.role_id,
            roleName: assignment.role_name,
            userName: buildDisplayName(
                assignment.first_name,
                assignment.last_name,
                assignment.email,
            ),
            email: assignment.email || 'unknown@sentinel.local',
            assignedAt: toNullableDate(assignment.assigned_at),
        }));
    }

    /**
     * Creates a new role assignment for a user.
     * Enforces guard logic based on the target role's system protection and assignable scopes.
     *
     * @param dbClient - The database client instance.
     * @param payload - The assignment details.
     * @param actorUserId - The ID of the user performing the action.
     * @param institutionId - The institution ID context.
     * @throws HTTPException - 403 Forbidden or 404 Not Found.
     */
    static async createAssignment(
        dbClient: DbClient,
        payload: AccessControlAssignmentInput,
        actorUserId?: string,
        institutionId?: string,
    ) {
        const targetRole = await RolesService.getRoleRecord(dbClient, payload.roleId);
        const normalizedTargetRole = targetRole.role_name.trim().toLowerCase();

        // Support can only assign roles that are marked as assignable by support
        if (targetRole.is_system && !targetRole.assignable_by?.includes('support')) {
            throw new HTTPException(403, {
                message: 'Support can only assign superadmin, admin, or instructor roles.',
            });
        }

        const targetUser = await getAuthUserById(dbClient, payload.userId);

        if (!targetUser) {
            throw new HTTPException(404, { message: 'User not found.' });
        }

        const currentRoleName = await resolveTargetUserRole(dbClient, payload.userId);
        const currentRole = currentRoleName
            ? await RolesRepository.findRoleBySlug(dbClient, currentRoleName)
            : null;

        if (currentRoleName && !currentRole) {
            throw new HTTPException(404, { message: 'Role not found.' });
        }

        if (
            currentRole &&
            currentRole.is_system &&
            !currentRole.assignable_by?.includes('support')
        ) {
            throw new HTTPException(403, {
                message:
                    'Support can only promote users whose current role is superadmin, admin, or instructor.',
            });
        }

        const replaceableRoles = await dbClient
            .selectFrom('roles')
            .select(['role_id', 'role_name'])
            .where(sql<boolean>`'support' = ANY(assignable_by)`)
            .execute();
        const replaceableRoleIds = replaceableRoles.map((role) => role.role_id);

        await dbClient
            .deleteFrom('user_roles')
            .where('user_id', '=', payload.userId)
            .where('role_id', 'in', replaceableRoleIds)
            .execute();

        await dbClient
            .insertInto('user_roles')
            .values({
                user_id: payload.userId,
                role_id: payload.roleId,
            })
            .onConflict((oc) => oc.columns(['user_id', 'role_id']).doNothing())
            .execute();

        await UserAuthService.syncUserRoleAuth(dbClient, payload.userId, normalizedTargetRole);

        const assignments = await this.getAssignments(dbClient);
        const created = assignments.find(
            (assignment) =>
                assignment.userId === payload.userId && assignment.roleId === payload.roleId,
        );

        if (!created) {
            throw new HTTPException(500, { message: 'Failed to create assignment.' });
        }

        let resolvedInstitutionId = institutionId;
        if (!resolvedInstitutionId) {
            const profile = await dbClient
                .selectFrom('user_profiles')
                .select(['institution_id'])
                .where('user_id', '=', payload.userId)
                .executeTakeFirst();
            resolvedInstitutionId = profile?.institution_id ?? undefined;
        }

        if (resolvedInstitutionId) {
            try {
                await LogsService.createLog(dbClient, {
                    userId: actorUserId || payload.userId,
                    action: 'security.assignment_created',
                    resourceType: 'role_assignment',
                    resourceId: `${payload.userId}:${payload.roleId}`,
                    activeInstitutionId: resolvedInstitutionId,
                    details: {
                        userId: payload.userId,
                        roleId: payload.roleId,
                        roleName: created.roleName,
                        userName: created.userName,
                    },
                });
            } catch (logErr) {
                console.error('Failed to log security.assignment_created:', logErr);
            }
        }

        if (actorUserId && institutionId) {
            await ActivityNotificationService.notifyGenericInstitutionActivity({
                dbClient,
                actorUserId,
                institutionId,
                operation: 'TRANSACTION_COMPLETED',
                targetType: 'ROLE_ASSIGNMENT',
                targetId: `${payload.userId}:${payload.roleId}`,
                targetLabel: `${created.userName} -> ${created.roleName}`,
                title: 'Role assignment updated',
                message: `A role assignment was created for ${created.userName}.`,
                sourceModule: 'access-control',
                sourceAction: 'assign-role',
                metadata: {
                    userId: payload.userId,
                    roleId: payload.roleId,
                },
            });
        }

        return created;
    }

    /**
     * Removes an access control role assignment for a user.
     * Enforces guard logic preventing deletion of non-deletable system assignments.
     *
     * @param dbClient - The database client instance.
     * @param userId - The user ID whose assignment is being removed.
     * @param roleId - The role ID to remove.
     * @param actorUserId - The ID of the user performing the action.
     * @param institutionId - The institution ID context.
     * @throws HTTPException - 400 Bad Request or 404 Not Found.
     */
    static async deleteAssignment(
        dbClient: DbClient,
        userId: string,
        roleId: number,
        actorUserId?: string,
        institutionId?: string,
    ) {
        const role = await RolesService.getRoleRecord(dbClient, roleId);

        if (role.assignable_by?.includes('support')) {
            throw new HTTPException(400, {
                message:
                    'Promotable roles cannot be removed here. Create a new assignment to change the user role instead.',
            });
        }

        await dbClient
            .deleteFrom('user_roles')
            .where('user_id', '=', userId)
            .where('role_id', '=', roleId)
            .execute();

        let resolvedInstitutionId = institutionId;
        if (!resolvedInstitutionId) {
            const profile = await dbClient
                .selectFrom('user_profiles')
                .select(['institution_id'])
                .where('user_id', '=', userId)
                .executeTakeFirst();
            resolvedInstitutionId = profile?.institution_id ?? undefined;
        }

        if (resolvedInstitutionId) {
            try {
                await LogsService.createLog(dbClient, {
                    userId: actorUserId || userId,
                    action: 'security.assignment_revoked',
                    resourceType: 'role_assignment',
                    resourceId: `${userId}:${roleId}`,
                    activeInstitutionId: resolvedInstitutionId,
                    details: {
                        userId,
                        roleId,
                        roleName: role.role_name,
                    },
                });
            } catch (logErr) {
                console.error('Failed to log security.assignment_revoked:', logErr);
            }
        }

        if (actorUserId && institutionId) {
            await ActivityNotificationService.notifyGenericInstitutionActivity({
                dbClient,
                actorUserId,
                institutionId,
                operation: 'TRANSACTION_COMPLETED',
                targetType: 'ROLE_ASSIGNMENT',
                targetId: `${userId}:${roleId}`,
                targetLabel: `${userId} -> ${role.role_name}`,
                title: 'Role assignment removed',
                message: `A role assignment was removed for role "${role.role_name}".`,
                sourceModule: 'access-control',
                sourceAction: 'remove-role',
                metadata: {
                    userId,
                    roleId,
                },
            });
        }
    }
}
