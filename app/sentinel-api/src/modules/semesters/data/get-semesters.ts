import { type DbClient } from '@sentinel/db';

// Type for getSemestersData function arguments
export type GetSemestersDataArgs = {
    dbClient: DbClient;
    institutionId?: string;
    search?: string;
};

// Get all semesters from the terms table
export async function getSemestersData({
    dbClient,
    institutionId,
    search,
}: GetSemestersDataArgs) {
    let query = dbClient
        .selectFrom('terms as t')
        .leftJoin('institutions as i', 'i.id', 't.institution_id')
        .selectAll('t')
        .select(['i.name as institution_name']);

    if (institutionId) {
        query = query.where('t.institution_id', '=', institutionId);
    }

    if (search) {
        query = query.where((eb) =>
            eb.or([
                eb('t.academic_year', 'ilike', `%${search}%`),
                eb('t.semester', 'ilike', `%${search}%`),
                eb('i.name', 'ilike', `%${search}%`),
            ]),
        );
    }

    const records = await query.orderBy('t.created_at', 'desc').execute();

    return records;
}

export type GetSemestersDataResponse = Awaited<ReturnType<typeof getSemestersData>>;
