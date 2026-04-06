import { type DbClient } from '@sentinel/db';

export const approveEnrollmentRequestData = async ({
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
            .select(['class_group_id', 'user_id', 'status'])
            .where('request_id', '=', requestId)
            .executeTakeFirst();

        if (!request) {
            throw new Error(`Enrollment request ${requestId} not found`);
        }

        if (request.status !== 'PENDING') {
            continue; // Skip if already processed
        }

        // 2. Find instructor role
        const instructorRole = await dbClient
            .selectFrom('roles')
            .select('role_id')
            .where('role_name', '=', 'instructor')
            .executeTakeFirst();

        if (!instructorRole) {
            throw new Error('Instructor role not defined in the database.');
        }

        // 3. Update status to APPROVED
        await dbClient
            .updateTable('enrollment_requests')
            .set({
                status: 'APPROVED',
                updated_at: new Date(),
                approved_by: approverId,
            })
            .where('request_id', '=', requestId)
            .execute();

        // 4. Insert into class_roles
        const existingRole = await dbClient
            .selectFrom('class_roles')
            .select('class_group_id')
            .where('class_group_id', '=', request.class_group_id)
            .where('user_id', '=', request.user_id)
            .executeTakeFirst();

        if (!existingRole) {
            await dbClient
                .insertInto('class_roles')
                .values({
                    class_group_id: request.class_group_id,
                    user_id: request.user_id,
                    role_id: instructorRole.role_id,
                    assigned_at: new Date(),
                })
                .execute();
        }

        results.push({
            class_group_id: request.class_group_id,
            user_id: request.user_id,
        });
    }

    return results;
};
