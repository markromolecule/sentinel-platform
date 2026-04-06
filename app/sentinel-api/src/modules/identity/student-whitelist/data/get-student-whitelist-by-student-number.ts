import { type DbClient } from '@sentinel/db';

export async function getStudentWhitelistByStudentNumberData({
    dbClient,
    institutionId,
    studentNumber,
}: {
    dbClient: DbClient;
    institutionId: string;
    studentNumber: string;
}) {
    return await dbClient
        .selectFrom('student_whitelist')
        .selectAll()
        .where('institution_id', '=', institutionId)
        .where('student_number', '=', studentNumber)
        .executeTakeFirst();
}

