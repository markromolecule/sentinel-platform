import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { SUPPORT_ASSIGNABLE_ROLE_NAMES } from '@sentinel/shared/constants';
import type { AccessControlAssignment, AccessControlAssignmentInput } from '@sentinel/shared/types';
import { resolveTargetUserRole } from '../../../identity/users/data/resolve-target-user-role';
import { UserAuthService } from '../../../identity/users/services/user-auth.service';
import { RolesService } from '../../roles/services/roles.service';
import { getAccessControlAssignmentsData } from '../data/get-access-control-assignments';
import { getAuthUserById } from '../data/get-auth-user-by-id';
import { ensureAccessControlCatalogs } from './access-control-catalog.service';

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

function isSupportAssignableRole(roleName: string | null | undefined) {
    return SUPPORT_ASSIGNABLE_ROLE_NAMES.includes(
        (roleName ?? '') as (typeof SUPPORT_ASSIGNABLE_ROLE_NAMES)[number],
    );
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

    static async createAssignment(dbClient: DbClient, payload: AccessControlAssignmentInput) {
        const targetRole = await RolesService.getRoleRecord(dbClient, payload.roleId);
        const normalizedTargetRole = targetRole.role_name.trim().toLowerCase();

        const CORE_ROLES = ['superadmin', 'admin', 'instructor', 'support'];
        const isCoreRole = (role: string | null | undefined) =>
            CORE_ROLES.includes((role ?? '').trim().toLowerCase());

        // Only enforce strict support validation if the target role is a core role
        if (isCoreRole(normalizedTargetRole) && !isSupportAssignableRole(normalizedTargetRole)) {
            throw new HTTPException(403, {
                message: 'Support can only assign superadmin, admin, or instructor roles.',
            });
        }

        const targetUser = await getAuthUserById(dbClient, payload.userId);

        if (!targetUser) {
            throw new HTTPException(404, { message: 'User not found.' });
        }

        const currentRole = await resolveTargetUserRole(dbClient, payload.userId);

        // Only enforce strict support validation if the user ALREADY has a core role that we are trying to replace
        if (currentRole && isCoreRole(currentRole) && !isSupportAssignableRole(currentRole)) {
            throw new HTTPException(403, {
                message:
                    'Support can only promote users whose current role is superadmin, admin, or instructor.',
            });
        }

        const replaceableRoles = await dbClient
            .selectFrom('roles')
            .select(['role_id', 'role_name'])
            .where('role_name', 'in', [...SUPPORT_ASSIGNABLE_ROLE_NAMES])
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

        return created;
    }

    static async deleteAssignment(dbClient: DbClient, userId: string, roleId: number) {
        const role = await RolesService.getRoleRecord(dbClient, roleId);

        if (isSupportAssignableRole(role.role_name)) {
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
    }
}
