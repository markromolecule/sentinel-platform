import { type DbClient } from '@sentinel/db';

export type UpdateSubjectCoursesDataArgs = {
    dbClient: DbClient;
    subjectId: string;
    courseIds: string[];
};

export async function updateSubjectCoursesData({
    dbClient,
    subjectId,
    courseIds,
}: UpdateSubjectCoursesDataArgs) {
    await dbClient.deleteFrom('course_subjects').where('subject_id', '=', subjectId).execute();

    if (courseIds.length === 0) {
        return;
    }

    await dbClient
        .insertInto('course_subjects')
        .values(
            courseIds.map((courseId) => ({
                subject_id: subjectId,
                course_id: courseId,
                year_level: null,
                semester: null,
            })),
        )
        .execute();
}
