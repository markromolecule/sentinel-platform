import { type DbClient } from '@sentinel/db';

export type UpdateSubjectClassificationSubjectsDataArgs = {
    dbClient: DbClient;
    subjectClassificationId: string;
    subjectIds: string[];
};

export async function updateSubjectClassificationSubjectsData({
    dbClient,
    subjectClassificationId,
    subjectIds,
}: UpdateSubjectClassificationSubjectsDataArgs) {
    await dbClient
        .deleteFrom('subject_classification_subjects')
        .where('subject_classification_id', '=', subjectClassificationId)
        .execute();

    if (subjectIds.length === 0) {
        return;
    }

    await dbClient
        .insertInto('subject_classification_subjects')
        .values(
            subjectIds.map((subjectId) => ({
                subject_classification_id: subjectClassificationId,
                subject_id: subjectId,
                created_at: new Date(),
            })),
        )
        .execute();
}
