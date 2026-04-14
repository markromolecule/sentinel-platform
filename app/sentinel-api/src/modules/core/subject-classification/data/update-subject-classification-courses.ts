import { type DbClient } from '@sentinel/db';

export type UpdateSubjectClassificationCoursesDataArgs = {
    dbClient: DbClient;
    subjectClassificationId: string;
    courseIds: string[];
};

export async function updateSubjectClassificationCoursesData({
    dbClient,
    subjectClassificationId,
    courseIds,
}: UpdateSubjectClassificationCoursesDataArgs) {
    await dbClient
        .deleteFrom('subject_classification_courses')
        .where('subject_classification_id', '=', subjectClassificationId)
        .execute();

    if (courseIds.length === 0) {
        return;
    }

    await dbClient
        .insertInto('subject_classification_courses')
        .values(
            courseIds.map((courseId) => ({
                subject_classification_id: subjectClassificationId,
                course_id: courseId,
                created_at: new Date(),
            })),
        )
        .execute();
}
