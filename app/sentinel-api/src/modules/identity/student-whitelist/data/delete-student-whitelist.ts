import { type DbClient } from '@sentinel/db';

export async function deleteStudentWhitelistData({
    dbClient,
    id,
}: {
    dbClient: DbClient;
    id: string;
}) {
    await dbClient
        .deleteFrom('student_whitelist')
        .where('whitelist_id', '=', id)
        .executeTakeFirstOrThrow();
}
