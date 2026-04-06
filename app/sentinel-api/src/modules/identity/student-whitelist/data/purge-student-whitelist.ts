import { type DbClient } from '@sentinel/db';

export async function purgeStudentWhitelistData({
    dbClient,
    institutionId,
    departmentId,
    courseId,
    status,
    includeClaimed,
}: {
    dbClient: DbClient;
    institutionId?: string;
    departmentId?: string;
    courseId?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
    includeClaimed?: boolean;
}) {
    let selectQuery = dbClient
        .selectFrom('student_whitelist')
        .select(['whitelist_id', 'claimed_user_id']);

    if (institutionId) {
        selectQuery = selectQuery.where('institution_id', '=', institutionId);
    }

    if (departmentId) {
        selectQuery = selectQuery.where('department_id', '=', departmentId);
    }

    if (courseId) {
        selectQuery = selectQuery.where('course_id', '=', courseId);
    }

    if (status) {
        selectQuery = selectQuery.where('status', '=', status);
    }

    const matchingRecords = await selectQuery.execute();
    const claimedRecords = matchingRecords.filter((record) => !!record.claimed_user_id);
    const deletableIds = matchingRecords
        .filter((record) => includeClaimed || !record.claimed_user_id)
        .map((record) => record.whitelist_id);

    if (deletableIds.length > 0) {
        await dbClient
            .deleteFrom('student_whitelist')
            .where('whitelist_id', 'in', deletableIds)
            .execute();
    }

    return {
        deletedCount: deletableIds.length,
        skippedClaimedCount: includeClaimed ? 0 : claimedRecords.length,
    };
}
