import { type DbClient } from '@sentinel/db';
import { type CreateUserBody, type UpdateUserBody } from './user.dto';
import { prepareUserForAuthDeletion } from './data/delete-user';
import { UserAuthService } from './services/user-auth.service';
import { UserInviteService } from './services/user-invite.service';
import { UserCrudService } from './services/user-crud.service';

export class UserService {
    // Get all users
    static async getUsers(
        dbClient: DbClient,
        institutionId: string | undefined,
        search?: string,
        limit?: number,
        offset?: number,
        requesterUserId?: string,
        requesterRole?: string,
        requesterDepartmentId?: string | null,
        requesterCourseId?: string | null,
        roleFilter?: string,
        roleFilters?: string[],
    ) {
        return await UserCrudService.getUsers(
            dbClient,
            institutionId,
            search,
            limit,
            offset,
            requesterUserId,
            requesterRole,
            requesterDepartmentId,
            requesterCourseId,
            roleFilter,
            roleFilters,
        );
    }
    // Get single user
    static async getUserById(
        dbClient: DbClient,
        id: string,
        institutionId?: string,
        requesterRole?: string,
        requesterUserId?: string,
        requesterDepartmentId?: string | null,
        requesterCourseId?: string | null,
    ) {
        return await UserCrudService.getUserById(
            dbClient,
            id,
            institutionId,
            requesterRole,
            requesterUserId,
            requesterDepartmentId,
            requesterCourseId,
        );
    }

    // Create user
    static async createUser(dbClient: DbClient, values: CreateUserBody) {
        // 1. Let Supabase create the Auth User and generate the ID
        const { id: userId } = await UserAuthService.createUserAuth(dbClient, values);

        // 2. Synchronize with Database Profile and Students
        try {
            return await UserCrudService.createUser(dbClient, userId, values);
        } catch (error) {
            // Rollback Auth user if DB sync fails
            await UserAuthService.deleteUserAuth(dbClient, userId);
            throw error;
        }
    }

    // Update user
    static async updateUser(
        dbClient: DbClient,
        id: string,
        values: UpdateUserBody,
        requesterRole?: string,
        institutionId?: string,
        requesterDepartmentId?: string | null,
        requesterCourseId?: string | null,
    ) {
        await UserCrudService.getUserById(
            dbClient,
            id,
            institutionId,
            requesterRole,
            undefined,
            requesterDepartmentId,
            requesterCourseId,
        );

        // 1. Update Auth record if email/role changed
        await UserAuthService.updateUserAuth(dbClient, id, values);

        // 2. Update DB Profile and Students record
        return await UserCrudService.updateUser(dbClient, id, values, requesterRole);
    }

    // Delete user
    static async deleteUser(
        dbClient: DbClient,
        id: string,
        requesterRole?: string,
        institutionId?: string,
        requesterUserId?: string,
        requesterDepartmentId?: string | null,
        requesterCourseId?: string | null,
    ) {
        await UserCrudService.getUserById(
            dbClient,
            id,
            institutionId,
            requesterRole,
            undefined,
            requesterDepartmentId,
            requesterCourseId,
        );

        // 1. Clear nullable references that would otherwise block auth.users deletion.
        await prepareUserForAuthDeletion({
            dbClient,
            id,
            requesterRole,
            requesterUserId,
        });

        // 2. Delete Auth record using Supabase Admin
        await UserAuthService.deleteUserAuth(dbClient, id);

        // 3. Cleanup remaining DB records after auth deletion succeeds.
        return await UserCrudService.deleteUser(dbClient, id, requesterRole, requesterUserId);
    }

    // Invite user
    static async inviteUser(dbClient: DbClient, values: CreateUserBody, requestOrigin?: string) {
        // 1. Send invite via Supabase Auth Admin
        const authCtx = await UserInviteService.inviteUserAuth(values, requestOrigin);

        // 2. Synchronize with Database Profile and Students/Instructors
        try {
            const user = await UserCrudService.createUser(dbClient, authCtx.id, values);

            return {
                user,
                inviteDelivery: authCtx.inviteDelivery,
                inviteLink: authCtx.inviteLink,
            };
        } catch (error) {
            // Rollback Auth user if DB sync fails
            await UserAuthService.deleteUserAuth(dbClient, authCtx.id);
            throw error;
        }
    }
}
