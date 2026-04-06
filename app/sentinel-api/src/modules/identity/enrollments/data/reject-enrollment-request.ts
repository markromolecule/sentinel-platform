import { type DbClient } from '@sentinel/db';

export const rejectEnrollmentRequestData = async ({
    dbClient,
    requestIds,
    approverId,
}: {
    dbClient: DbClient;
    requestIds: string[];
    approverId: string;
}) => {
    const results = [];

    for (const requestId of requestIds) {
        // 1. Get the request
        const request = await dbClient
            .selectFrom('enrollment_requests')
            .select(['status'])
            .where('request_id', '=', requestId)
            .executeTakeFirst();

        if (!request) {
            throw new Error(`Enrollment request ${requestId} not found`);
        }

        if (request.status !== 'PENDING') {
            continue; // Skip if already processed
        }

        // 2. Update status to REJECTED
        await dbClient
            .updateTable('enrollment_requests')
            .set({
                status: 'REJECTED',
                updated_at: new Date(),
                approved_by: approverId,
            })
            .where('request_id', '=', requestId)
            .execute();

        results.push(requestId);
    }

    return results;
};
