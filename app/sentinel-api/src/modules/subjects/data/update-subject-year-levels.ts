import { type DbClient } from '@/lib/create-db-client';

export type UpdateSubjectYearLevelsDataArgs = {
    dbClient: DbClient;
    subjectId: string;
    yearLevels: number[];
};

export async function updateSubjectYearLevelsData({
    dbClient,
    subjectId,
    yearLevels,
}: UpdateSubjectYearLevelsDataArgs) {
    await dbClient
        .deleteFrom('subject_year_levels')
        .where('subject_id', '=', subjectId)
        .execute();

    if (yearLevels.length === 0) {
        return;
    }

    await dbClient
        .insertInto('subject_year_levels')
        .values(
            yearLevels.map((yearLevel) => ({
                subject_id: subjectId,
                year_level: yearLevel,
            })),
        )
        .execute();
}
