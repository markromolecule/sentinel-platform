import { type DbClient } from '@sentinel/db';

export async function getStudentWhitelistByStudentNumbersData({
    dbClient,
    institutionId,
    studentNumbers,
}: {
    dbClient: DbClient;
    institutionId: string;
    studentNumbers: string[];
}) {
    if (!studentNumbers.length) {
        return [];
    }

    return await dbClient
        .selectFrom('student_whitelist')
        .select(['whitelist_id', 'student_number'])
        .where('institution_id', '=', institutionId)
        .where('student_number', 'in', studentNumbers)
        .execute();
}
