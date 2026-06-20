import { type DbClient } from '@sentinel/db';
import { type CreateUserBody, type UpdateUserBody } from '../user.dto';
import { createUserData } from '../data/create-user';
import { deleteUserData } from '../data/delete-user';
import {
    getInstructorStudentEnrollmentDetailData,
    getStudentEnrollmentDetailDataForAdmin,
} from '../data/get-instructor-student-enrollment-detail';
import { getInstructorStudentEnrollmentsData } from '../data/get-instructor-student-enrollments';
import { getInstructorDashboardData } from '../data/get-instructor-dashboard-data';
import { getUserData } from '../data/get-user';
import { getUsersData } from '../data/get-users';
import { updateUserData } from '../data/update-user';
import { LogsService } from '../../../general/logs/logs.service';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';

export class UserCrudService {
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
        includeInstitutionUsers?: boolean,
    ) {
        return await getUsersData({
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
            includeInstitutionUsers,
        });
    }

    static async getInstructorDashboard(
        dbClient: DbClient,
        requesterUserId: string,
        institutionId?: string,
    ) {
        return await getInstructorDashboardData({
            dbClient,
            requesterUserId,
            institutionId,
        });
    }

    static async getInstructorStudentEnrollments(
        dbClient: DbClient,
        institutionId: string | undefined,
        requesterUserId: string,
        search?: string,
    ) {
        return await getInstructorStudentEnrollmentsData({
            dbClient,
            institutionId,
            requesterUserId,
            search,
        });
    }

    static async getInstructorStudentEnrollmentDetail(
        dbClient: DbClient,
        institutionId: string | undefined,
        requesterUserId: string,
        targetUserId: string,
    ) {
        return await getInstructorStudentEnrollmentDetailData({
            dbClient,
            institutionId,
            requesterUserId,
            targetUserId,
        });
    }

    static async getStudentEnrollmentDetail(
        dbClient: DbClient,
        institutionId: string | undefined,
        targetUserId: string,
    ) {
        return await getStudentEnrollmentDetailDataForAdmin({
            dbClient,
            institutionId,
            targetUserId,
        });
    }

    static async getUserById(
        dbClient: DbClient,
        id: string,
        institutionId?: string,
        requesterRole?: string,
        requesterUserId?: string,
        requesterDepartmentId?: string | null,
        requesterCourseId?: string | null,
    ) {
        return await getUserData({
            dbClient,
            id,
            institutionId,
            requesterRole,
            requesterUserId,
            requesterDepartmentId,
            requesterCourseId,
        });
    }

    static async createUser(dbClient: DbClient, userId: string, values: CreateUserBody) {
        const institutionId =
            values.institution && values.institution !== '' ? values.institution : null;
        const departmentId =
            values.department && values.department !== '' ? values.department : null;
        const normalizedCourseIds = Array.from(
            new Set(
                (values.role === 'instructor'
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

        const result = await createUserData({
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
                          employee_number:
                              (values as any).employeeNo || `EMP-${userId.slice(0, 8)}`,
                          department_id: departmentId!,
                          institution_id: institutionId,
                          course_id: courseId,
                      }
                    : undefined,
            instructorCourseIds: values.role === 'instructor' ? normalizedCourseIds : [],
            email: values.email,
            role: values.role,
        });

        if (institutionId) {
            try {
                await LogsService.createLog(dbClient, {
                    userId: userId,
                    action: 'user.created',
                    resourceType: 'user',
                    resourceId: userId,
                    activeInstitutionId: institutionId,
                    details: {
                        email: values.email,
                        role: values.role,
                        firstName: values.firstName,
                        lastName: values.lastName,
                        departmentId,
                        courseId,
                    },
                });
            } catch (logErr) {
                console.error('Failed to log user.created:', logErr);
            }

            try {
                await ActivityNotificationService.notifyInstitutionActivityCreated({
                    dbClient,
                    actorUserId: userId,
                    institutionId,
                    targetType: 'USER',
                    targetId: userId,
                    targetLabel: `${values.firstName} ${values.lastName}`,
                    title: 'User profile created',
                    message: `A new user profile was created for "${values.firstName} ${values.lastName}" (${values.role}).`,
                    sourceModule: 'users',
                    sourceAction: 'create',
                    metadata: {
                        email: values.email,
                        role: values.role,
                        departmentId,
                        courseId,
                    },
                });
            } catch (notifErr) {
                console.error('Failed to notify user.created:', notifErr);
            }
        }

        return result;
    }

    static async updateUser(
        dbClient: DbClient,
        id: string,
        values: UpdateUserBody,
        requesterRole?: string,
    ) {
        const profile = await dbClient
            .selectFrom('user_profiles')
            .select(['institution_id'])
            .where('user_id', '=', id)
            .executeTakeFirst();

        const result = await updateUserData({
            dbClient,
            id,
            values,
            requesterRole,
        });

        if (profile?.institution_id) {
            try {
                await LogsService.createLog(dbClient, {
                    userId: id,
                    action: 'user.updated',
                    resourceType: 'user',
                    resourceId: id,
                    activeInstitutionId: profile.institution_id,
                    details: { updatedFields: Object.keys(values) },
                });
            } catch (logErr) {
                console.error('Failed to log user.updated:', logErr);
            }

            try {
                await ActivityNotificationService.notifyInstitutionActivityUpdated({
                    dbClient,
                    actorUserId: id,
                    institutionId: profile.institution_id,
                    targetType: 'USER',
                    targetId: id,
                    targetLabel: id,
                    title: 'User profile updated',
                    message: `User profile with ID "${id}" has been updated.`,
                    sourceModule: 'users',
                    sourceAction: 'update',
                    metadata: {
                        updatedFields: Object.keys(values),
                    },
                });
            } catch (notifErr) {
                console.error('Failed to notify user.updated:', notifErr);
            }
        }

        return result;
    }

    static async deleteUser(
        dbClient: DbClient,
        id: string,
        requesterRole?: string,
        requesterUserId?: string,
    ) {
        const profile = await dbClient
            .selectFrom('user_profiles')
            .select(['institution_id'])
            .where('user_id', '=', id)
            .executeTakeFirst();

        const result = await deleteUserData({
            dbClient,
            id,
            requesterRole,
            requesterUserId,
        });

        if (profile?.institution_id) {
            try {
                await LogsService.createLog(dbClient, {
                    userId: id,
                    action: 'user.deleted',
                    resourceType: 'user',
                    resourceId: id,
                    activeInstitutionId: profile.institution_id,
                    details: { reason: 'administrative purge' },
                });
            } catch (logErr) {
                console.error('Failed to log user.deleted:', logErr);
            }

            try {
                await ActivityNotificationService.notifyInstitutionActivityDeleted({
                    dbClient,
                    actorUserId: requesterUserId || id,
                    institutionId: profile.institution_id,
                    targetType: 'USER',
                    targetId: id,
                    targetLabel: id,
                    title: 'User profile deleted',
                    message: `User profile with ID "${id}" has been administratively deleted.`,
                    sourceModule: 'users',
                    sourceAction: 'delete',
                    metadata: {
                        reason: 'administrative purge',
                    },
                });
            } catch (notifErr) {
                console.error('Failed to notify user.deleted:', notifErr);
            }
        }

        return result;
    }
}
