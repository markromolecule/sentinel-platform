import { type DbClient } from '@sentinel/db';
import { EnrollInstructorSubjectBody, EnrollStudentsBody } from './enrollments.dto';
import { enrollStudentsData } from './data/enroll-students';
import { unenrollInstructorSubjectData } from './data/unenroll-instructor-subject';
import { enrollInstructorData } from './data/enroll-instructor';
import { getEnrolledSubjectsData } from './data/get-enrolled-subjects';
import { getEnrollmentRequestsData } from './data/get-enrollment-requests';
import { approveEnrollmentRequestData } from './data/approve-enrollment-request';
import { rejectEnrollmentRequestData } from './data/reject-enrollment-request';
import { unapproveEnrollmentRequestData } from './data/unapprove-enrollment-request';
import { deleteEnrollmentRequestsData } from './data/delete-enrollment-requests';
import { updateEnrollmentRequestData } from './data/update-enrollment-request';
import { previewStudentEnrollmentData } from './data/preview-student-enrollment';
import { getStudentClassroomsData } from './data/get-student-classrooms';
import { unenrollStudentData } from './data/unenroll-student';
import { ActivityNotificationService } from '../../general/notification/services/activity-notification.service';
import { LogsService } from '../../general/logs/logs.service';

export class EnrollmentService {
    static async getEnrolledSubjects(dbClient: DbClient, userId: string, search?: string) {
        return await getEnrolledSubjectsData({ dbClient, userId, search });
    }

    static async enrollInstructor(
        dbClient: DbClient,
        userId: string,
        payload: EnrollInstructorSubjectBody,
        instructorDepartmentId?: string | null,
    ) {
        const result = await enrollInstructorData({
            dbClient,
            userId,
            payload,
            instructorDepartmentId,
        });

        if (result.newRequestsCount > 0 && result.createdRequestIds.length > 0) {
            await ActivityNotificationService.notifySubjectEnrollmentRequestSubmitted({
                dbClient,
                actorUserId: userId,
                institutionId: result.institutionId,
                subjectOfferingId: result.subjectOfferingId,
                subjectLabel: result.subjectLabel,
                requestIds: result.createdRequestIds,
                requestCount: result.newRequestsCount,
            });

            // Telemetry logging
            try {
                await LogsService.createLog(dbClient, {
                    userId: userId,
                    action: 'enrollment.requested',
                    resourceType: 'enrollment',
                    resourceId: result.subjectOfferingId,
                    activeInstitutionId: result.institutionId,
                    details: {
                        subjectOfferingId: result.subjectOfferingId,
                        requestCount: result.newRequestsCount,
                        requestIds: result.createdRequestIds,
                    },
                });
            } catch (logErr) {
                console.error('Failed to log enrollment.requested:', logErr);
            }
        }

        return result;
    }

    static async getEnrollmentRequests(
        dbClient: DbClient,
        args: {
            status?: 'PENDING' | 'APPROVED' | 'REJECTED';
            userId?: string;
            institutionId?: string;
            departmentId?: string;
            courseId?: string;
            search?: string;
        } = {},
    ) {
        return await getEnrollmentRequestsData({ dbClient, ...args });
    }

    static async approveEnrollmentRequest(
        dbClient: DbClient,
        requestIds: string[],
        approverId: string,
    ) {
        const result = await approveEnrollmentRequestData({ dbClient, requestIds, approverId });
        const processedRequestIds = result.map((row: any) => row.request_id).filter(Boolean);

        if (processedRequestIds.length > 0) {
            await ActivityNotificationService.notifySubjectEnrollmentRequestApproved({
                dbClient,
                actorUserId: approverId,
                requestIds: processedRequestIds,
            });

            try {
                const profile = await dbClient
                    .selectFrom('user_profiles')
                    .select(['institution_id'])
                    .where('user_id', '=', approverId)
                    .executeTakeFirst();

                if (profile?.institution_id) {
                    await LogsService.createLog(dbClient, {
                        userId: approverId,
                        action: 'enrollment.approved',
                        resourceType: 'enrollment',
                        resourceId: processedRequestIds[0],
                        activeInstitutionId: profile.institution_id,
                        details: { requestIds: processedRequestIds },
                    });
                }
            } catch (logErr) {
                console.error('Failed to log enrollment.approved:', logErr);
            }
        }

        return result;
    }

    static async rejectEnrollmentRequest(
        dbClient: DbClient,
        requestIds: string[],
        approverId: string,
    ) {
        const result = await rejectEnrollmentRequestData({ dbClient, requestIds, approverId });

        if (result.length > 0) {
            await ActivityNotificationService.notifySubjectEnrollmentRequestRejected({
                dbClient,
                actorUserId: approverId,
                requestIds: result,
            });

            try {
                const profile = await dbClient
                    .selectFrom('user_profiles')
                    .select(['institution_id'])
                    .where('user_id', '=', approverId)
                    .executeTakeFirst();

                if (profile?.institution_id) {
                    await LogsService.createLog(dbClient, {
                        userId: approverId,
                        action: 'enrollment.rejected',
                        resourceType: 'enrollment',
                        resourceId: result[0],
                        activeInstitutionId: profile.institution_id,
                        details: { requestIds: result, reason: 'request rejected' },
                    });
                }
            } catch (logErr) {
                console.error('Failed to log enrollment.rejected:', logErr);
            }
        }

        return result;
    }

    static async unapproveEnrollmentRequest(dbClient: DbClient, requestIds: string[]) {
        return await unapproveEnrollmentRequestData({ dbClient, requestIds });
    }

    static async deleteEnrollmentRequests(dbClient: DbClient, requestIds: string[]) {
        return await deleteEnrollmentRequestsData({ dbClient, requestIds });
    }

    static async updateEnrollmentRequest(
        dbClient: DbClient,
        args: Omit<Parameters<typeof updateEnrollmentRequestData>[0], 'dbClient'>,
    ) {
        return await updateEnrollmentRequestData({
            dbClient,
            ...args,
        });
    }

    static async unenrollInstructorSubject(
        dbClient: DbClient,
        userId: string,
        subjectId: string,
        status?: 'PENDING' | 'APPROVED' | 'REJECTED',
        classGroupIds?: string[],
    ) {
        const result = await unenrollInstructorSubjectData({
            dbClient,
            userId,
            subjectId,
            status,
            classGroupIds,
        });

        try {
            const profile = await dbClient
                .selectFrom('user_profiles')
                .select(['institution_id'])
                .where('user_id', '=', userId)
                .executeTakeFirst();

            if (profile?.institution_id) {
                await LogsService.createLog(dbClient, {
                    userId: userId,
                    action: 'enrollment.deleted',
                    resourceType: 'enrollment',
                    resourceId: subjectId,
                    activeInstitutionId: profile.institution_id,
                    details: { subjectId, classGroupIds, status },
                });
            }
        } catch (logErr) {
            console.error('Failed to log instructor enrollment.deleted:', logErr);
        }

        return result;
    }

    static async enrollStudents(
        dbClient: DbClient,
        institutionId: string,
        userId: string,
        payload: EnrollStudentsBody,
    ) {
        const result = await enrollStudentsData({ dbClient, institutionId, userId, payload });

        try {
            await LogsService.createLog(dbClient, {
                userId: userId,
                action: 'enrollment.bulk_student_enrolled',
                resourceType: 'enrollment',
                resourceId: payload.classGroupId,
                activeInstitutionId: institutionId,
                details: {
                    classGroupId: payload.classGroupId,
                    studentNumbersCount: payload.studentNumbers?.length || 0,
                },
            });
        } catch (logErr) {
            console.error('Failed to log enrollment.bulk_student_enrolled:', logErr);
        }

        return result;
    }

    static async previewStudentEnrollment(
        dbClient: DbClient,
        institutionId: string,
        userId: string,
        studentNumbers: string[],
        classGroupId?: string,
    ) {
        return await previewStudentEnrollmentData({
            dbClient,
            institutionId,
            userId,
            studentNumbers,
            classGroupId,
        });
    }

    static async getStudentClassrooms(dbClient: DbClient, userId: string) {
        return await getStudentClassroomsData({ dbClient, userId });
    }

    static async unenrollStudent(dbClient: DbClient, enrollmentId: string) {
        const enrollment = await dbClient
            .selectFrom('enrollments as e')
            .innerJoin('class_groups as cg', 'cg.class_group_id', 'e.class_group_id')
            .select(['cg.institution_id', 'e.student_id'])
            .where('e.enrollment_id', '=', enrollmentId)
            .executeTakeFirst();

        const result = await unenrollStudentData({ dbClient, enrollmentId });

        if (enrollment?.institution_id) {
            try {
                await LogsService.createLog(dbClient, {
                    userId: '00000000-0000-0000-0000-000000000000',
                    action: 'enrollment.deleted',
                    resourceType: 'enrollment',
                    resourceId: enrollmentId,
                    activeInstitutionId: enrollment.institution_id,
                    details: { enrollmentId, studentId: enrollment.student_id },
                });
            } catch (logErr) {
                console.error('Failed to log enrollment.deleted:', logErr);
            }
        }

        return result;
    }

    /**
     * Unenrolls multiple students by deleting their enrollment records and logging telemetry.
     *
     * @param dbClient - Database client
     * @param enrollmentIds - Array of enrollment IDs to delete
     */
    static async bulkUnenrollStudents(dbClient: DbClient, enrollmentIds: string[]): Promise<void> {
        const enrollments = await dbClient
            .selectFrom('enrollments as e')
            .innerJoin('class_groups as cg', 'cg.class_group_id', 'e.class_group_id')
            .select(['cg.institution_id', 'e.student_id', 'e.enrollment_id'])
            .where('e.enrollment_id', 'in', enrollmentIds)
            .execute();

        await dbClient
            .deleteFrom('enrollments')
            .where('enrollment_id', 'in', enrollmentIds)
            .execute();

        for (const enrollment of enrollments) {
            if (enrollment.institution_id) {
                try {
                    await LogsService.createLog(dbClient, {
                        userId: '00000000-0000-0000-0000-000000000000',
                        action: 'enrollment.deleted',
                        resourceType: 'enrollment',
                        resourceId: enrollment.enrollment_id,
                        activeInstitutionId: enrollment.institution_id,
                        details: {
                            enrollmentId: enrollment.enrollment_id,
                            studentId: enrollment.student_id,
                        },
                    });
                } catch (logErr) {
                    console.error('Failed to log enrollment.deleted:', logErr);
                }
            }
        }
    }
}
