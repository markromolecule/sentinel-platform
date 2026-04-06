import { type DbClient } from '@sentinel/db';

export async function getAcademicScopeData({
    dbClient,
    departmentId,
    courseId,
}: {
    dbClient: DbClient;
    departmentId: string;
    courseId: string;
}) {
    return await dbClient
        .selectFrom('departments as dept')
        .leftJoin('courses as course', (join) =>
            join
                .onRef('course.department_id', '=', 'dept.department_id')
                .on('course.course_id', '=', courseId),
        )
        .select((eb) => [
            'dept.department_id',
            'dept.institution_id as department_institution_id',
            'course.course_id',
            'course.institution_id as course_institution_id',
            eb
                .exists(
                    eb
                        .selectFrom('courses as existing_course')
                        .select('existing_course.course_id')
                        .where('existing_course.course_id', '=', courseId),
                )
                .as('course_exists'),
        ])
        .where('dept.department_id', '=', departmentId)
        .executeTakeFirst();
}
