import { type DbClient } from '@sentinel/db';
import { type EnrollInstructorSubjectBody, type EnrollStudentsBody } from './enrollments.dto';
import { type updateEnrollmentRequestData } from './data/update-enrollment-request';
import { getEnrolledSubjectsService } from './services/get-enrolled-subjects.service';
import { enrollInstructorService } from './services/enroll-instructor.service';
import { assignOfferedSubjectService } from './services/assign-offered-subject.service';
import { getEnrollmentRequestsService } from './services/get-enrollment-requests.service';
import { approveEnrollmentRequestService } from './services/approve-enrollment-request.service';
import { rejectEnrollmentRequestService } from './services/reject-enrollment-request.service';
import {
    unapproveEnrollmentRequestService,
    deleteEnrollmentRequestsService,
    updateEnrollmentRequestService,
} from './services/manage-enrollment-requests.service';
import { unenrollInstructorSubjectService } from './services/unenroll-instructor-subject.service';
import {
    enrollStudentsService,
    previewStudentEnrollmentService,
} from './services/enroll-students.service';
import {
    getStudentClassroomsService,
    unenrollStudentService,
    bulkUnenrollStudentsService,
} from './services/unenroll-student.service';

export class EnrollmentService {
    /**
     * @deprecated Use getEnrolledSubjectsService directly
     */
    static async getEnrolledSubjects(
        dbClient: DbClient,
        userId: string,
        search?: string,
        page?: number,
        pageSize?: number,
    ) {
        return getEnrolledSubjectsService({ dbClient, userId, search, page, pageSize });
    }

    /**
     * @deprecated Use enrollInstructorService directly
     */
    static async enrollInstructor(
        dbClient: DbClient,
        userId: string,
        payload: EnrollInstructorSubjectBody,
        instructorDepartmentId?: string | null,
    ) {
        return enrollInstructorService({ dbClient, userId, payload, instructorDepartmentId });
    }

    /**
     * @deprecated Use getEnrollmentRequestsService directly
     */
    static async getEnrollmentRequests(
        dbClient: DbClient,
        args: {
            status?: 'PENDING' | 'APPROVED' | 'REJECTED';
            userId?: string;
            institutionId?: string;
            departmentId?: string;
            courseId?: string;
            search?: string;
            page?: number;
            pageSize?: number;
        } = {},
    ) {
        return getEnrollmentRequestsService({ dbClient, ...args });
    }

    /**
     * @deprecated Use approveEnrollmentRequestService directly
     */
    static async approveEnrollmentRequest(
        dbClient: DbClient,
        requestIds: string[],
        approverId: string,
    ) {
        return approveEnrollmentRequestService({ dbClient, requestIds, approverId });
    }

    /**
     * @deprecated Use rejectEnrollmentRequestService directly
     */
    static async rejectEnrollmentRequest(
        dbClient: DbClient,
        requestIds: string[],
        approverId: string,
    ) {
        return rejectEnrollmentRequestService({ dbClient, requestIds, approverId });
    }

    /**
     * @deprecated Use unapproveEnrollmentRequestService directly
     */
    static async unapproveEnrollmentRequest(dbClient: DbClient, requestIds: string[]) {
        return unapproveEnrollmentRequestService({ dbClient, requestIds });
    }

    /**
     * @deprecated Use deleteEnrollmentRequestsService directly
     */
    static async deleteEnrollmentRequests(dbClient: DbClient, requestIds: string[]) {
        return deleteEnrollmentRequestsService({ dbClient, requestIds });
    }

    /**
     * @deprecated Use updateEnrollmentRequestService directly
     */
    static async updateEnrollmentRequest(
        dbClient: DbClient,
        args: Omit<Parameters<typeof updateEnrollmentRequestData>[0], 'dbClient'>,
    ) {
        return updateEnrollmentRequestService({ dbClient, ...args });
    }

    /**
     * @deprecated Use unenrollInstructorSubjectService directly
     */
    static async unenrollInstructorSubject(
        dbClient: DbClient,
        userId: string,
        subjectId: string,
        status?: 'PENDING' | 'APPROVED' | 'REJECTED',
        classGroupIds?: string[],
    ) {
        return unenrollInstructorSubjectService({
            dbClient,
            userId,
            subjectId,
            status,
            classGroupIds,
        });
    }

    /**
     * @deprecated Use enrollStudentsService directly
     */
    static async enrollStudents(
        dbClient: DbClient,
        institutionId: string,
        userId: string,
        userRole: string | undefined,
        payload: EnrollStudentsBody,
    ) {
        return enrollStudentsService({ dbClient, institutionId, userId, userRole, payload });
    }

    /**
     * @deprecated Use previewStudentEnrollmentService directly
     */
    static async previewStudentEnrollment(
        dbClient: DbClient,
        institutionId: string,
        userId: string,
        userRole: string | undefined,
        studentNumbers: string[],
        classGroupId?: string,
    ) {
        return previewStudentEnrollmentService({
            dbClient,
            institutionId,
            userId,
            userRole,
            studentNumbers,
            classGroupId,
        });
    }

    /**
     * @deprecated Use getStudentClassroomsService directly
     */
    static async getStudentClassrooms(dbClient: DbClient, userId: string) {
        return getStudentClassroomsService({ dbClient, userId });
    }

    /**
     * @deprecated Use unenrollStudentService directly
     */
    static async unenrollStudent(dbClient: DbClient, enrollmentId: string) {
        return unenrollStudentService({ dbClient, enrollmentId });
    }

    /**
     * Unenrols multiple students by deleting their enrollment records and logging telemetry.
     *
     * @deprecated Use bulkUnenrollStudentsService directly
     * @param dbClient - Database client
     * @param enrollmentIds - Array of enrollment IDs to delete
     */
    static async bulkUnenrollStudents(dbClient: DbClient, enrollmentIds: string[]): Promise<void> {
        return bulkUnenrollStudentsService({ dbClient, enrollmentIds });
    }

    static async assignOfferedSubject(
        dbClient: DbClient,
        instructorId: string,
        subjectOfferingId: string,
        approvedBy: string,
    ) {
        return assignOfferedSubjectService({
            dbClient,
            instructorId,
            subjectOfferingId,
            approvedBy,
        });
    }
}
