import { type DbClient } from '@sentinel/db';

export type GetSubjectByCodeDataArgs = {
    dbClient: DbClient;
    code: string;
    excludeId?: string;
};

export async function getSubjectByCodeData({
    dbClient,
    code,
    excludeId,
}: GetSubjectByCodeDataArgs) {
    let query = dbClient
        .selectFrom('subjects')
        .select('subject_id')
        .where(({ eb, fn, ref, val }: any) =>
            eb(fn('lower', [ref('subject_code')]), '=', val(code.trim().toLowerCase())),
        );

    if (excludeId) {
        query = query.where('subject_id', '!=', excludeId);
    }

    return await query.executeTakeFirst();
}

export type GetSubjectByCodeDataResponse = Awaited<ReturnType<typeof getSubjectByCodeData>>;
