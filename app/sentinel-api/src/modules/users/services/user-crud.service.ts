import { type DbClient } from '@sentinel/db';
import { type CreateUserBody, type UpdateUserBody } from '../user.dto';
import { createUserData } from '../data/create-user';
import { deleteUserData } from '../data/delete-user';
import { getUserData } from '../data/get-user';
import { getUsersData } from '../data/get-users';
import { updateUserData } from '../data/update-user';

export class UserCrudService {
    static async getUsers(
        dbClient: DbClient,
        institutionId: string | undefined,
        search?: string,
        requesterRole?: string,
    ) {
        return await getUsersData({
            dbClient,
            institutionId,
            search,
            requesterRole,
        });
    }

    static async getUserById(
        dbClient: DbClient,
        id: string,
        institutionId?: string,
        requesterRole?: string,
    ) {
        return await getUserData({
            dbClient,
            id,
            institutionId,
            requesterRole,
        });
    }

    static async createUser(dbClient: DbClient, userId: string, values: CreateUserBody) {
        const institutionId =
            values.institution && values.institution !== '' ? values.institution : null;
        const departmentId =
            values.department && values.department !== '' ? values.department : null;
        const normalizedCourseIds = Array.from(
            new Set(
                (
                    values.role === 'instructor'
                        ? values.courseIds?.length
                            ? values.courseIds
                            : values.course
                              ? [values.course]
                              : []
                        : values.course
                          ? [values.course]
                          : []
                ).filter(Boolean),
            ),
        );
        const courseId = normalizedCourseIds[0] ?? null;
        const studentNo = values.studentNo && values.studentNo !== '' ? values.studentNo : null;

        return await createUserData({
            dbClient,
            userId,
            profile: {
                user_id: userId,
                first_name: values.firstName,
                last_name: values.lastName,
                institution_id: institutionId,
                department_id: departmentId,
                course_id: courseId,
            },
            student:
                values.role === 'student'
                    ? {
                          user_id: userId,
                          student_number: studentNo!,
                          department_id: departmentId!,
                          institution_id: institutionId,
                          course_id: courseId,
                      }
                    : undefined,
            instructor:
                values.role !== 'student'
                    ? {
                          user_id: userId,
                          employee_number: (values as any).employeeNo || `EMP-${userId.slice(0, 8)}`,
                          department_id: departmentId!,
                          institution_id: institutionId,
                          course_id: courseId,
                      }
                    : undefined,
            instructorCourseIds: values.role === 'instructor' ? normalizedCourseIds : [],
            email: values.email,
            role: values.role,
        });
    }

    static async updateUser(
        dbClient: DbClient,
        id: string,
        values: UpdateUserBody,
        requesterRole?: string,
    ) {
        return await updateUserData({
            dbClient,
            id,
            values,
            requesterRole,
        });
    }

    static async deleteUser(
        dbClient: DbClient,
        id: string,
        requesterRole?: string,
        requesterUserId?: string,
    ) {
        return await deleteUserData({
            dbClient,
            id,
            requesterRole,
            requesterUserId,
        });
    }
}
