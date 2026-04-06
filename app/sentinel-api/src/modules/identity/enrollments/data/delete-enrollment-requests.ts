import { type DbClient } from '@sentinel/db';

export const deleteEnrollmentRequestsData = async ({
    dbClient,
    requestIds,
}: {
    dbClient: DbClient;
    requestIds: string[];
}) => {
    const uniqueRequestIds = Array.from(new Set(requestIds));

    const instructorRole = await dbClient
        .selectFrom('roles')
        .select('role_id')
        .where('role_name', '=', 'instructor')
        .executeTakeFirst();

    if (!instructorRole) {
        throw new Error('Instructor role not defined in the database.');
    }

    const requests = await dbClient
        .selectFrom('enrollment_requests')
        .select(['request_id', 'class_group_id', 'user_id', 'status'])
        .where('request_id', 'in', uniqueRequestIds)
        .execute();

    if (requests.length !== uniqueRequestIds.length) {
        const foundRequestIds = new Set(requests.map((request) => request.request_id));
        const missingRequestId = uniqueRequestIds.find((requestId) => !foundRequestIds.has(requestId));
        throw new Error(`Enrollment request ${missingRequestId} not found`);
    }

    for (const request of requests) {
        if (request.status !== 'APPROVED') {
            continue;
        }

        await dbClient
            .deleteFrom('class_roles')
            .where('class_group_id', '=', request.class_group_id)
            .where('user_id', '=', request.user_id)
            .where('role_id', '=', instructorRole.role_id)
            .execute();
    }

    await dbClient
        .deleteFrom('enrollment_requests')
        .where('request_id', 'in', uniqueRequestIds)
        .execute();

    return {
        deleted_count: uniqueRequestIds.length,
    };
};
