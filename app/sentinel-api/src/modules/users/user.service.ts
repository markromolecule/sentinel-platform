import { type DbClient } from '@sentinel/db';
import { type CreateUserBody, type UpdateUserBody } from './user.dto';
import { UserAuthService } from './services/user-auth.service';
import { UserInviteService } from './services/user-invite.service';
import { UserCrudService } from './services/user-crud.service';

export class UserService {
    // Get all users
    static async getUsers(
        dbClient: DbClient,
        institutionId: string | undefined,
        search?: string,
        requesterRole?: string,
    ) {
        return await UserCrudService.getUsers(dbClient, institutionId, search, requesterRole);
    }
    // Get single user
    static async getUserById(
        dbClient: DbClient,
        id: string,
        institutionId?: string,
        requesterRole?: string,
    ) {
        return await UserCrudService.getUserById(dbClient, id, institutionId, requesterRole);
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
    ) {
        await UserCrudService.getUserById(dbClient, id, institutionId, requesterRole);

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
    ) {
        await UserCrudService.getUserById(dbClient, id, institutionId, requesterRole);

        // 1. Explicitly release any claimed whitelist rows before auth deletion nulls the foreign key.
        await dbClient
            .updateTable('student_whitelist')
            .set({
                claimed_user_id: null,
                claimed_at: null,
                updated_at: new Date(),
                updated_by: requesterUserId ?? null,
            })
            .where('claimed_user_id', '=', id)
            .execute();

        // 2. Delete Auth record using Supabase Admin
        await UserAuthService.deleteUserAuth(dbClient, id);

        // 3. Cleanup other DB records
        return await UserCrudService.deleteUser(dbClient, id, requesterRole, requesterUserId);
    }

    // Invite user
    static async inviteUser(dbClient: DbClient, values: CreateUserBody, requestOrigin?: string) {
        // 1. Send invite via Supabase Auth Admin
        const authCtx = await UserInviteService.inviteUserAuth(values, requestOrigin);

        // 2. Synchronize with Database Profile and Students/Instructors
        try {
            return await UserCrudService.createUser(dbClient, authCtx.id, values);
        } catch (error) {
            // Rollback Auth user if DB sync fails
            await UserAuthService.deleteUserAuth(dbClient, authCtx.id);
            throw error;
        }
    }
}
