import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';
import { type UserQueryBuilder } from './get-user.types';

function buildInstructorCourseSummarySubquery(dbClient: DbClient) {
    return dbClient
        .selectFrom('instructor_courses as ic')
        .leftJoin('courses as icc', 'icc.course_id', 'ic.course_id')
        .select([
            'ic.instructor_id',
            sql<
                string[]
            >`COALESCE(array_remove(array_agg(DISTINCT ic.course_id), NULL), ARRAY[]::uuid[])`.as(
                'instructor_course_ids',
            ),
            sql<
                string[]
            >`COALESCE(array_remove(array_agg(DISTINCT icc.title), NULL), ARRAY[]::text[])`.as(
                'instructor_course_names',
            ),
        ])
        .groupBy('ic.instructor_id')
        .as('instructor_course_summary');
}

export function withBaseUserProfile(dbClient: DbClient, userId: string) {
    return dbClient
        .selectFrom('user_profiles as up')
        .innerJoin('auth.users as u', 'u.id', 'up.user_id')
        .leftJoin('students as s', 's.user_id', 'up.user_id')
        .leftJoin('instructors as ins', 'ins.user_id', 'up.user_id')
        .leftJoin('departments as sd', 'sd.department_id', 's.department_id')
        .leftJoin('departments as id', 'id.department_id', 'ins.department_id')
        .leftJoin('institutions as i', 'i.id', 'up.institution_id')
        .leftJoin('user_roles as ur', 'ur.user_id', 'up.user_id')
        .leftJoin('roles as r', 'r.role_id', 'ur.role_id')
        .leftJoin('departments as dept', 'dept.department_id', 'up.department_id')
        .leftJoin('courses as c', 'c.course_id', 'up.course_id')
        .where('up.user_id', '=', userId)
        .select((eb) => [
            'up.user_id',
            'up.first_name',
            'up.last_name',
            'up.created_at',
            'up.updated_at',
            'u.email',
            'u.raw_user_meta_data',
            'r.role_name',
            's.student_number',
            'ins.employee_number',
            eb.fn
                .coalesce('dept.department_id', 'sd.department_id', 'id.department_id')
                .as('department_id'),
            eb.fn
                .coalesce(
                    eb.fn('trim', ['dept.department_code']),
                    eb.fn('trim', ['sd.department_code']),
                    eb.fn('trim', ['id.department_code']),
                )
                .as('department_code'),
            'up.institution_id',
            'i.name as institution_name',
            'c.course_id',
            'c.title as primary_course_name',
            'up.status',
            'up.last_seen_at',
            'ins.instructor_id',
        ])
        .groupBy([
            'up.user_id',
            'up.first_name',
            'up.last_name',
            'up.created_at',
            'up.updated_at',
            'u.email',
            'u.raw_user_meta_data',
            'r.role_name',
            's.student_number',
            'ins.employee_number',
            'dept.department_id',
            'sd.department_id',
            'id.department_id',
            'dept.department_code',
            'sd.department_code',
            'id.department_code',
            'up.institution_id',
            'i.name',
            'c.course_id',
            'c.title',
            'up.status',
            'up.last_seen_at',
            'ins.instructor_id',
        ]);
}

export function withInstructorCourseAggregations<T>(
    query: UserQueryBuilder<T>,
    dbClient: DbClient,
    supportsInstructorCourses: boolean,
) {
    if (!supportsInstructorCourses) {
        return query.select([
            sql<string[]>`ARRAY[]::uuid[]`.as('instructor_course_ids'),
            sql<string[]>`ARRAY[]::text[]`.as('instructor_course_names'),
        ]);
    }

    const instructorCourseSummary = buildInstructorCourseSummarySubquery(dbClient);

    return query
        .leftJoin(
            instructorCourseSummary,
            'instructor_course_summary.instructor_id',
            'ins.instructor_id',
        )
        .select([
            'instructor_course_summary.instructor_course_ids',
            'instructor_course_summary.instructor_course_names',
        ])
        .groupBy([
            'instructor_course_summary.instructor_course_ids',
            'instructor_course_summary.instructor_course_names',
        ]);
}
