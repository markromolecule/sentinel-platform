import { type DbClient } from '@sentinel/db';
import { getEnrollmentRequestsData } from '../data/get-enrollment-requests';
import { paginateItems } from '../../../../lib/pagination';

export type GetEnrollmentRequestsServiceArgs = {
    dbClient: DbClient;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    userId?: string;
    institutionId?: string;
    departmentId?: string;
    courseId?: string;
    search?: string;
    page?: number;
    pageSize?: number;
};

/**
 * Returns enrolment requests, optionally filtered by status, user, institution,
 * department, course, or search string.
 *
 * @param args - Filter arguments forwarded directly to the data layer
 */
export async function getEnrollmentRequestsService({
    dbClient,
    page,
    pageSize,
    ...filters
}: GetEnrollmentRequestsServiceArgs) {
    const requests = await getEnrollmentRequestsData({ dbClient, ...filters });
    return paginateItems(requests, page, pageSize);
}

export type GetEnrollmentRequestsServiceResponse = Awaited<
    ReturnType<typeof getEnrollmentRequestsService>
>;
