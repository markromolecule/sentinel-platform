import { type DbClient } from '@sentinel/db';

export type UpdateSubjectOfferingYearLevelsDataArgs = {
    dbClient: DbClient;
    subjectOfferingId: string;
    yearLevels: number[];
};

export async function updateSubjectOfferingYearLevelsData({
    dbClient,
    subjectOfferingId,
    yearLevels,
}: UpdateSubjectOfferingYearLevelsDataArgs) {
    await dbClient
        .deleteFrom('subject_offering_year_levels')
        .where('subject_offering_id', '=', subjectOfferingId)
        .execute();

    if (yearLevels.length === 0) {
        return;
    }

    await dbClient
        .insertInto('subject_offering_year_levels')
        .values(
            yearLevels.map((yearLevel) => ({
                subject_offering_id: subjectOfferingId,
                year_level: yearLevel,
            })),
        )
        .execute();
}
