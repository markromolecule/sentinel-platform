import { type DbClient } from '@sentinel/db';
import { unapproveEnrollmentRequestData } from '../data/unapprove-enrollment-request';
import { deleteEnrollmentRequestsData } from '../data/delete-enrollment-requests';
import { updateEnrollmentRequestData } from '../data/update-enrollment-request';

export type UnapproveEnrollmentRequestServiceArgs = {
    dbClient: DbClient;
    requestIds: string[];
};

/**
 * Reverts one or more enrolment requests back to PENDING status.
 *
 * @param args.dbClient - Database client
 * @param args.requestIds - IDs of requests to unapprove
 */
export async function unapproveEnrollmentRequestService({
    dbClient,
    requestIds,
}: UnapproveEnrollmentRequestServiceArgs) {
    return unapproveEnrollmentRequestData({ dbClient, requestIds });
}

// ---------------------------------------------------------------------------

export type DeleteEnrollmentRequestsServiceArgs = {
    dbClient: DbClient;
    requestIds: string[];
};

/**
 * Permanently deletes enrolment requests by ID.
 *
 * @param args.dbClient - Database client
 * @param args.requestIds - IDs of requests to delete
 */
export async function deleteEnrollmentRequestsService({
    dbClient,
    requestIds,
}: DeleteEnrollmentRequestsServiceArgs) {
    return deleteEnrollmentRequestsData({ dbClient, requestIds });
}

// ---------------------------------------------------------------------------

export type UpdateEnrollmentRequestServiceArgs = Omit<
    Parameters<typeof updateEnrollmentRequestData>[0],
    'dbClient'
> & { dbClient: DbClient };

/**
 * Updates fields on an existing enrolment request.
 *
 * @param args - Forwarded directly to the data layer (minus dbClient wrapper)
 */
export async function updateEnrollmentRequestService({
    dbClient,
    ...args
}: UpdateEnrollmentRequestServiceArgs) {
    return updateEnrollmentRequestData({ dbClient, ...args });
}

export type UpdateEnrollmentRequestServiceResponse = Awaited<
    ReturnType<typeof updateEnrollmentRequestService>
>;
