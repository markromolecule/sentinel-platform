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
            profile: {
                user_id: userId,
                first_name: values.firstName,
                last_name: values.lastName,
                institution_id: values.institution,
            },
            student:
                values.role === 'student'
                    ? {
                          user_id: userId,
                          student_number: values.studentNo ?? undefined,
                          department_id: values.department ?? undefined,
                          institution_id: values.institution,
                      }
                    : undefined,
            email: values.email,
            role: values.role,
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
