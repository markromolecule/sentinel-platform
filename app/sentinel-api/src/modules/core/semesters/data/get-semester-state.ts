import { type DbClient } from '@sentinel/db';

export type GetSemesterStateDataArgs = {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
};

export async function getSemesterStateData({
    dbClient,
    id,
    institutionId,
}: GetSemesterStateDataArgs) {
    let query = dbClient
        .selectFrom('terms')
        .select(['institution_id', 'is_active'])
        .where('term_id', '=', id);

    if (institutionId) {
        query = query.where((eb) =>
            eb.or([eb('institution_id', '=', institutionId), eb('institution_id', 'is', null)]),
        );
    }

    return await query.executeTakeFirstOrThrow();
}

export type GetSemesterStateDataResponse = Awaited<ReturnType<typeof getSemesterStateData>>;
