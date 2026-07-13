import { sql } from 'kysely';
import {
    INSTRUCTOR_ROLE_NAME,
    type GetUserDataArgs,
    SUPERADMIN_ROLE_NAME,
    type UserQueryBuilder,
} from './get-user.types';

const EFFECTIVE_ROLE_NAME_SQL = sql<
    string | null
>`lower(coalesce(r.role_name, nullif(u.raw_user_meta_data->>'role', '')))`;

export function applyInstitutionScope<T>(query: UserQueryBuilder<T>, args: GetUserDataArgs) {
    const { institutionId, requesterRole } = args;

    if (requesterRole !== SUPERADMIN_ROLE_NAME && requesterRole !== 'support' && institutionId) {
        return query.where('up.institution_id', '=', institutionId);
    }

    return query;
}

export function applyRequesterLimits<T>(
    query: UserQueryBuilder<T>,
    args: GetUserDataArgs,
    supportsInstructorCourses: boolean,
) {
    const { requesterRole, requesterUserId, requesterDepartmentId, requesterCourseId } = args;

    if (requesterRole === 'admin') {
        if (requesterDepartmentId) {
            query = query.where((eb) =>
                eb.or([
                    eb('up.department_id', '=', requesterDepartmentId),
                    eb('ins.department_id', '=', requesterDepartmentId),
                    eb('s.department_id', '=', requesterDepartmentId),
                ]),
            );
        }

        if (requesterCourseId) {
            query = query.where((eb) =>
                supportsInstructorCourses
                    ? eb.or([
                          eb('r.role_name', '=', INSTRUCTOR_ROLE_NAME),
                          eb('up.course_id', '=', requesterCourseId),
                          eb('s.course_id', '=', requesterCourseId),
                          eb('ins.course_id', '=', requesterCourseId),
                          eb.exists(
                              eb
                                  .selectFrom('instructor_courses as ic_scope')
                                  .select('ic_scope.instructor_id')
                                  .whereRef('ic_scope.instructor_id', '=', 'ins.instructor_id')
                                  .where('ic_scope.course_id', '=', requesterCourseId),
                          ),
                      ])
                    : eb.or([
                          eb('r.role_name', '=', INSTRUCTOR_ROLE_NAME),
                          eb('up.course_id', '=', requesterCourseId),
                          eb('s.course_id', '=', requesterCourseId),
                          eb('ins.course_id', '=', requesterCourseId),
                      ]),
            );
        }
    }

    if (requesterRole === 'support') {
        return query.where((eb) =>
            eb.or([
                eb(EFFECTIVE_ROLE_NAME_SQL, 'in', ['superadmin', 'admin', 'instructor', 'support']),
                ...(requesterUserId ? [eb('up.user_id', '=', requesterUserId)] : []),
            ]),
        );
    }

    return query;
}

