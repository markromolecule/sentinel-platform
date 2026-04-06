import { type DbClient } from '@sentinel/db';

export type GetSubjectByCodeDataArgs = {
    dbClient: DbClient;
    code: string;
    institutionId?: string | null;
    excludeId?: string;
};

export async function getSubjectByCodeData({
    dbClient,
    code,
    institutionId,
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

    if (institutionId !== undefined) {
        query = institutionId
            ? query.where('institution_id', '=', institutionId)
            : query.where('institution_id', 'is', null);
    }

    return await query.executeTakeFirst();
}

export type GetSubjectByCodeDataResponse = Awaited<ReturnType<typeof getSubjectByCodeData>>;
