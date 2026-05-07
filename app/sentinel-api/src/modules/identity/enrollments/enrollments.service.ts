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
        return await enrollInstructorData({
            dbClient,
            userId,
            payload,
            instructorDepartmentId,
        });
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
        return await approveEnrollmentRequestData({ dbClient, requestIds, approverId });
    }

    static async rejectEnrollmentRequest(
        dbClient: DbClient,
        requestIds: string[],
        approverId: string,
    ) {
        return await rejectEnrollmentRequestData({ dbClient, requestIds, approverId });
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
