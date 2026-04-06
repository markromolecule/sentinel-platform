import { type DbClient } from '@sentinel/db';

export type UpdateSubjectOfferingSectionsDataArgs = {
    dbClient: DbClient;
    subjectOfferingId: string;
    sectionIds: string[];
};

export async function updateSubjectOfferingSectionsData({
    dbClient,
    subjectOfferingId,
    sectionIds,
}: UpdateSubjectOfferingSectionsDataArgs) {
    await dbClient
        .deleteFrom('subject_offering_sections')
        .where('subject_offering_id', '=', subjectOfferingId)
        .execute();

    if (sectionIds.length === 0) {
        return;
    }

    await dbClient
        .insertInto('subject_offering_sections')
        .values(
            sectionIds.map((sectionId) => ({
                subject_offering_id: subjectOfferingId,
                section_id: sectionId,
            })),
        )
        .execute();
}
