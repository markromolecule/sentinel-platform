import { type DbClient } from '@sentinel/db';
import crypto from 'node:crypto';
import { type CreateUserBody, type UpdateUserBody } from './user.dto';
import { UserAuthService } from './services/user-auth.service';
import { UserCrudService } from './services/user-crud.service';

export class UserService {
    static async getUsers(dbClient: DbClient, institutionId: string) {
        return await UserCrudService.getUsers(dbClient, institutionId);
    }

    static async getUserById(dbClient: DbClient, id: string, institutionId: string) {
        return await UserCrudService.getUserById(dbClient, id, institutionId);
    }

    static async createUser(dbClient: DbClient, values: CreateUserBody) {
        const userId = crypto.randomUUID();

        // 1. Create the Auth User (Manual DB insert)
        await UserAuthService.createUserAuth(dbClient, userId, values);

        // 2. Synchronize with Database Profile and Students
        try {
            return await UserCrudService.createUser(dbClient, userId, values);
        } catch (error) {
            // Rollback Auth user if DB sync fails
            await UserAuthService.deleteUserAuth(dbClient, userId);
            throw error;
        }
    }

    static async updateUser(dbClient: DbClient, id: string, values: UpdateUserBody) {
        // 1. Update Auth record if email/role changed
        await UserAuthService.updateUserAuth(dbClient, id, values);

        // 2. Update DB Profile and Students record
        return await UserCrudService.updateUser(dbClient, id, values);
    }

    static async deleteUser(dbClient: DbClient, id: string) {
        // 1. Delete Auth record (manual DB delete)
        await UserAuthService.deleteUserAuth(dbClient, id);

        // 2. Cleanup other DB records
        return await UserCrudService.deleteUser(dbClient, id);
    }
}
