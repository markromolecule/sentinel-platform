import { type DbClient } from '@sentinel/db';
import { supportsInstructorCourseTable } from '../helper/instructor-course-compat';

type SyncInstructorCoursesArgs = {
    dbClient: DbClient;
    instructorId: string;
    courseIds: string[];
};

export async function syncInstructorCourses({
    dbClient,
    instructorId,
    courseIds,
}: SyncInstructorCoursesArgs) {
    if (!(await supportsInstructorCourseTable(dbClient))) {
        return;
    }

    const uniqueCourseIds = Array.from(new Set(courseIds.filter(Boolean)));

    await dbClient
        .deleteFrom('instructor_courses')
        .where('instructor_id', '=', instructorId)
        .execute();

    if (uniqueCourseIds.length === 0) {
        return;
    }

    await dbClient
        .insertInto('instructor_courses')
        .values(
            uniqueCourseIds.map((courseId) => ({
                instructor_id: instructorId,
                course_id: courseId,
            })),
        )
        .execute();
}
