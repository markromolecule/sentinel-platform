import { type DbClient } from '@sentinel/db';
import { type CreateUserBody, type UpdateUserBody } from '../user.dto';
import { createUserData } from '../data/create-user';
import { deleteUserData } from '../data/delete-user';
import { getUserData } from '../data/get-user';
import { getUsersData } from '../data/get-users';
import { updateUserData } from '../data/update-user';

export class UserCrudService {
    static async getUsers(dbClient: DbClient, institutionId: string) {
        return await getUsersData({
            dbClient,
            institutionId,
        });
    }

    static async getUserById(dbClient: DbClient, id: string, institutionId: string) {
        return await getUserData({
            dbClient,
            id,
            institutionId,
        });
    }

    static async createUser(dbClient: DbClient, userId: string, values: CreateUserBody) {
        return await createUserData({
            dbClient,
            userId,
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            role: values.role,
            institutionId: values.institution,
            departmentId: values.department ?? undefined,
            studentNo: values.studentNo ?? undefined,
        });
    }

    static async updateUser(dbClient: DbClient, id: string, values: UpdateUserBody) {
        return await updateUserData({
            dbClient,
            id,
            values,
        });
    }

    static async deleteUser(dbClient: DbClient, id: string) {
        return await deleteUserData({
            dbClient,
            id,
        });
    }
}
