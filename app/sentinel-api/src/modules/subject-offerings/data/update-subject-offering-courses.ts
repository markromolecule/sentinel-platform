import { type DbClient } from '@sentinel/db';

export type UpdateSubjectOfferingCoursesDataArgs = {
    dbClient: DbClient;
    subjectOfferingId: string;
    courseIds: string[];
};

export async function updateSubjectOfferingCoursesData({
    dbClient,
    subjectOfferingId,
    courseIds,
}: UpdateSubjectOfferingCoursesDataArgs) {
    await dbClient
        .deleteFrom('subject_offering_courses')
        .where('subject_offering_id', '=', subjectOfferingId)
        .execute();

    if (courseIds.length === 0) {
        return;
    }

    await dbClient
        .insertInto('subject_offering_courses')
        .values(
            courseIds.map((courseId) => ({
                subject_offering_id: subjectOfferingId,
                course_id: courseId,
            })),
        )
        .execute();
}
