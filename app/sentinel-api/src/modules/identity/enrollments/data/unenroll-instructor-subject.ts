import { type DbClient } from '@sentinel/db';

export const unenrollInstructorSubjectData = async ({
    dbClient,
    userId,
    subjectId,
    status,
    classGroupIds,
}: {
    dbClient: DbClient;
    userId: string;
    subjectId: string;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    classGroupIds?: string[];
}) => {
    if (!classGroupIds || classGroupIds.length === 0) return;

    // 1. Delete enrollment_requests
    let requestQuery = dbClient
        .deleteFrom('enrollment_requests')
        .where('user_id', '=', userId)
        .where('class_group_id', 'in', classGroupIds);

    if (status) {
        requestQuery = requestQuery.where('status', '=', status);
    }

    await requestQuery.execute();

    // 3. Delete class_roles (only if they were already approved AND we are unenrolling approved or everything)
    if (!status || status === 'APPROVED') {
        await dbClient
            .deleteFrom('class_roles')
            .where('user_id', '=', userId)
            .where('class_group_id', 'in', classGroupIds)
            .execute();
    }
};
