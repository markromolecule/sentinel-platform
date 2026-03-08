import { type DbClient } from '@/lib/create-db-client';

export type UpdateSubjectSectionsDataArgs = {
    dbClient: DbClient;
    subjectId: string;
    sectionIds: string[];
};

export async function updateSubjectSectionsData({
    dbClient,
    subjectId,
    sectionIds,
}: UpdateSubjectSectionsDataArgs) {
    await dbClient
        .deleteFrom('subject_sections')
        .where('subject_id', '=', subjectId)
        .execute();

    if (sectionIds.length === 0) {
        return;
    }

    await dbClient
        .insertInto('subject_sections')
        .values(
            sectionIds.map((sectionId) => ({
                subject_id: subjectId,
                section_id: sectionId,
            })),
        )
        .execute();
}
