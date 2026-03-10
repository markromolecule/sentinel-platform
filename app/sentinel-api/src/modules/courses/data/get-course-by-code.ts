import { type DbClient } from '@sentinel/db';

export type GetCourseByCodeDataArgs = {
    dbClient: DbClient;
    code: string;
    institutionId: string;
};

export async function getCourseByCodeData({
    dbClient,
    code,
    institutionId,
}: GetCourseByCodeDataArgs) {
    const record = await dbClient
        .selectFrom('courses')
        .where('code', '=', code)
        .where('institution_id', '=', institutionId)
        .selectAll()
        .executeTakeFirst();

    return record;
}

export type GetCourseByCodeDataResponse = Awaited<ReturnType<typeof getCourseByCodeData>>;
