import { type DbClient } from '@sentinel/db';
import { EnrollInstructorSubjectBody } from './enrollments.dto';
import { unenrollInstructorSubjectData } from './data/unenroll-instructor-subject';
import { enrollInstructorData } from './data/enroll-instructor';
import { getEnrolledSubjectsData } from './data/get-enrolled-subjects';
import { getEnrollmentRequestsData } from './data/get-enrollment-requests';
import { approveEnrollmentRequestData } from './data/approve-enrollment-request';
import { rejectEnrollmentRequestData } from './data/reject-enrollment-request';
import { unapproveEnrollmentRequestData } from './data/unapprove-enrollment-request';
import { deleteEnrollmentRequestsData } from './data/delete-enrollment-requests';

export class EnrollmentService {
    static async getEnrolledSubjects(dbClient: DbClient, userId: string, search?: string) {
        return await getEnrolledSubjectsData({ dbClient, userId, search });
    }

    static async enrollInstructor(
        dbClient: DbClient,
        userId: string,
        payload: EnrollInstructorSubjectBody,
    ) {
        return await enrollInstructorData({ dbClient, userId, payload });
    }

    static async getEnrollmentRequests(
        dbClient: DbClient,
        status?: 'PENDING' | 'APPROVED' | 'REJECTED',
        userId?: string,
    ) {
        return await getEnrollmentRequestsData({ dbClient, status, userId });
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

    static async unapproveEnrollmentRequest(
        dbClient: DbClient,
        requestIds: string[],
    ) {
        return await unapproveEnrollmentRequestData({ dbClient, requestIds });
    }

    static async deleteEnrollmentRequests(
        dbClient: DbClient,
        requestIds: string[],
    ) {
        return await deleteEnrollmentRequestsData({ dbClient, requestIds });
    }

    static async unenrollInstructorSubject(
        dbClient: DbClient,
        userId: string,
        subjectId: string,
        status?: 'PENDING' | 'APPROVED' | 'REJECTED',
        classGroupIds?: string[],
    ) {
        return await unenrollInstructorSubjectData({ dbClient, userId, subjectId, status, classGroupIds });
    }
}
