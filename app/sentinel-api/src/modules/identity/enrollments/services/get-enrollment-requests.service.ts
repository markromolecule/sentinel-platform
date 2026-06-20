import { type DbClient } from '@sentinel/db';
import { getEnrollmentRequestsData } from '../data/get-enrollment-requests';

export type GetEnrollmentRequestsServiceArgs = {
    dbClient: DbClient;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    userId?: string;
    institutionId?: string;
    departmentId?: string;
    courseId?: string;
    search?: string;
};

/**
 * Returns enrolment requests, optionally filtered by status, user, institution,
 * department, course, or search string.
 *
 * @param args - Filter arguments forwarded directly to the data layer
 */
export async function getEnrollmentRequestsService({
    dbClient,
    ...filters
}: GetEnrollmentRequestsServiceArgs) {
    return getEnrollmentRequestsData({ dbClient, ...filters });
}

export type GetEnrollmentRequestsServiceResponse = Awaited<
    ReturnType<typeof getEnrollmentRequestsService>
>;
