import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';
import { INSTRUCTOR_ROLE_NAME, type UsersQueryBuilder } from './get-users.types';

export const EFFECTIVE_ROLE_NAME_SQL = sql<
    string | null
>`lower(coalesce(r.role_name, nullif(u.raw_user_meta_data->>'role', '')))`;

function buildEnrollmentSummarySubquery(
    dbClient: DbClient,
    {
        requesterRole,
        requesterUserId,
    }: {
        requesterRole?: string;
        requesterUserId?: string;
    },
) {
    let query = dbClient
        .selectFrom('enrollments as e')
        .innerJoin('class_groups as cg', 'cg.class_group_id', 'e.class_group_id')
        .leftJoin('subjects as sub', 'sub.subject_id', 'cg.subject_id')
        .leftJoin('sections as sec', 'sec.section_id', 'cg.section_id')
        .leftJoin('terms as t', 't.term_id', 'cg.term_id')
        .select([
            'e.student_id',
            sql<string | null>`STRING_AGG(DISTINCT sub.subject_title, ', ')`.as('subject_name'),
            sql<string | null>`STRING_AGG(DISTINCT sec.section_name, ', ')`.as('section_name'),
            sql<
                string | null
            >`STRING_AGG(DISTINCT CONCAT(t.academic_year, ' - ', t.semester), ', ')`.as(
                'term_name',
            ),
            sql<
                number[]
            >`COALESCE(array_remove(array_agg(DISTINCT sec.year_level), NULL), ARRAY[]::int[])`.as(
                'year_levels',
            ),
        ])
        .groupBy('e.student_id');

    if (requesterRole === INSTRUCTOR_ROLE_NAME && requesterUserId) {
        query = query
            .innerJoin('class_roles as cr_scope', 'cr_scope.class_group_id', 'cg.class_group_id')
            .innerJoin('roles as role_scope', 'role_scope.role_id', 'cr_scope.role_id')
            .where('cr_scope.user_id', '=', requesterUserId)
            .where('role_scope.role_name', '=', INSTRUCTOR_ROLE_NAME);
    }

    return query.as('enrollment_summary');
}

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

export function withBaseUserProfile(dbClient: DbClient) {
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
        .select((eb) => [
            'up.user_id',
            'up.first_name',
            'up.last_name',
            'up.created_at',
            'up.updated_at',
            'u.email',
            'u.raw_user_meta_data',
            'r.role_name',
            EFFECTIVE_ROLE_NAME_SQL.as('effective_role_name'),
            's.student_number',
            'ins.employee_number',
            eb.fn
                .coalesce('dept.department_id', 'sd.department_id', 'id.department_id')
                .as('department_id'),
            eb.fn
                .coalesce(
                    eb.fn('trim', ['sd.department_code']),
                    eb.fn('trim', ['id.department_code']),
                    eb.fn('trim', ['dept.department_code']),
                )
                .as('department_code'),
            'up.institution_id',
            'up.course_id',
            eb.ref('i.name').as('institution_name'),
            eb.ref('c.title').as('primary_course_name'),
            'up.status',
            'up.last_seen_at',
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
            'sd.department_code',
            'id.department_code',
            'dept.department_code',
            'up.institution_id',
            'up.course_id',
            'i.name',
            'c.title',
            'up.status',
            'up.last_seen_at',
        ]);
}

export function withEnrollmentAggregations<T>(
    query: UsersQueryBuilder<T>,
    dbClient: DbClient,
    {
        requesterRole,
        requesterUserId,
    }: {
        requesterRole?: string;
        requesterUserId?: string;
    },
) {
    const enrollmentSummary = buildEnrollmentSummarySubquery(dbClient, {
        requesterRole,
        requesterUserId,
    });

    return query
        .leftJoin(enrollmentSummary, 'enrollment_summary.student_id', 's.student_id')
        .select([
            'enrollment_summary.subject_name',
            'enrollment_summary.section_name',
            'enrollment_summary.term_name',
            'enrollment_summary.year_levels',
        ])
        .groupBy([
            'enrollment_summary.subject_name',
            'enrollment_summary.section_name',
            'enrollment_summary.term_name',
            'enrollment_summary.year_levels',
        ]);
}

export function withInstructorCourseAggregations<T>(
    query: UsersQueryBuilder<T>,
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
