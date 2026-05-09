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
        return await unenrollInstructorSubjectData({
            dbClient,
            userId,
            subjectId,
            status,
            classGroupIds,
        });
    }

    static async enrollStudents(
        dbClient: DbClient,
        institutionId: string,
        userId: string,
        payload: EnrollStudentsBody,
    ) {
        return await enrollStudentsData({ dbClient, institutionId, userId, payload });
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
        return await unenrollStudentData({ dbClient, enrollmentId });
    }
}
