import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import type { AccessControlAssignment, AccessControlAssignmentInput } from '@sentinel/shared/types';
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

export class AccessControlAssignmentService {
    static async getAssignments(dbClient: DbClient): Promise<AccessControlAssignment[]> {
        await ensureAccessControlCatalogs(dbClient);

        const assignments = await getAccessControlAssignmentsData(dbClient);

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
        await RolesService.getRoleRecord(dbClient, payload.roleId);

        const targetUser = await getAuthUserById(dbClient, payload.userId);

        if (!targetUser) {
            throw new HTTPException(404, { message: 'User not found.' });
        }

        await dbClient
            .insertInto('user_roles')
            .values({
                user_id: payload.userId,
                role_id: payload.roleId,
            })
            .onConflict((oc) => oc.columns(['user_id', 'role_id']).doNothing())
            .execute();

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
        await dbClient
            .deleteFrom('user_roles')
            .where('user_id', '=', userId)
            .where('role_id', '=', roleId)
            .execute();
    }
}
