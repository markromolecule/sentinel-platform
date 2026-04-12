import {
    DEFAULT_USERS_LIMIT,
    DEFAULT_USERS_OFFSET,
    type GetUsersDataArgs,
    INSTRUCTOR_ROLE_NAME,
    SUPERADMIN_ROLE_NAME,
    type UsersQueryBuilder,
} from './get-users.types';
import { SUPPORT_ASSIGNABLE_ROLE_NAMES } from '@sentinel/shared/constants';
import { EFFECTIVE_ROLE_NAME_SQL } from './get-users.query';

export function applyRequesterLimits<T>(
    query: UsersQueryBuilder<T>,
    args: GetUsersDataArgs,
    supportsInstructorCourses: boolean,
) {
    const {
        requesterRole,
        requesterDepartmentId,
        requesterCourseId,
        requesterUserId,
        roleFilter,
        roleFilters,
    } = args;

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

        if (requesterCourseId && roleFilter !== INSTRUCTOR_ROLE_NAME) {
            query = query.where((eb) =>
                supportsInstructorCourses
                    ? eb.or([
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
                          eb('up.course_id', '=', requesterCourseId),
                          eb('s.course_id', '=', requesterCourseId),
                          eb('ins.course_id', '=', requesterCourseId),
                      ]),
            );
        }
    }

    if (requesterRole === 'support') {
        const scopedRoleFilters =
            roleFilters?.filter((roleName) =>
                SUPPORT_ASSIGNABLE_ROLE_NAMES.includes(
                    roleName as (typeof SUPPORT_ASSIGNABLE_ROLE_NAMES)[number],
                ),
            ) ?? [];

        return query.where(
            EFFECTIVE_ROLE_NAME_SQL,
            'in',
            scopedRoleFilters.length > 0
                ? [...scopedRoleFilters]
                : [...SUPPORT_ASSIGNABLE_ROLE_NAMES],
        );
    }

    if (requesterRole === 'instructor') {
        return query
            .where(EFFECTIVE_ROLE_NAME_SQL, '=', 'student')
            .where((eb) =>
                eb.exists(
                    eb
                        .selectFrom('enrollments as e_filter')
                        .innerJoin(
                            'class_groups as cg_filter',
                            'cg_filter.class_group_id',
                            'e_filter.class_group_id',
                        )
                        .innerJoin(
                            'class_roles as cr_filter',
                            'cr_filter.class_group_id',
                            'cg_filter.class_group_id',
                        )
                        .innerJoin(
                            'roles as role_filter',
                            'role_filter.role_id',
                            'cr_filter.role_id',
                        )
                        .select('e_filter.enrollment_id')
                        .whereRef('e_filter.student_id', '=', 's.student_id')
                        .where('role_filter.role_name', '=', INSTRUCTOR_ROLE_NAME)
                        .where('cr_filter.user_id', '=', requesterUserId!),
                ),
            );
    }

    return query.where((eb) =>
        eb.or([eb('r.role_name', '!=', SUPERADMIN_ROLE_NAME), eb('r.role_name', 'is', null)]),
    );
}

export function applySearchAndFilters<T>(query: UsersQueryBuilder<T>, args: GetUsersDataArgs) {
    const { institutionId, roleFilter, roleFilters, search } = args;

    if (institutionId) {
        query = query.where('up.institution_id', '=', institutionId);
    }

    const normalizedRoleFilters = roleFilters?.length
        ? Array.from(new Set(roleFilters))
        : roleFilter
          ? [roleFilter]
          : [];

    if (normalizedRoleFilters.length > 0) {
        if (normalizedRoleFilters.length === 1 && normalizedRoleFilters[0] === INSTRUCTOR_ROLE_NAME) {
            query = query.where(EFFECTIVE_ROLE_NAME_SQL, '=', INSTRUCTOR_ROLE_NAME);
        } else if (normalizedRoleFilters.length === 1 && normalizedRoleFilters[0] === 'student') {
            query = query.where((eb) =>
                eb.or([eb('r.role_name', '=', 'student'), eb('s.user_id', 'is not', null)]),
            );
        } else {
            query = query.where(EFFECTIVE_ROLE_NAME_SQL, 'in', normalizedRoleFilters);
        }
    }

    if (search) {
        query = query.where((eb) =>
            eb.or([
                eb('up.first_name', 'ilike', `%${search}%`),
                eb('up.last_name', 'ilike', `%${search}%`),
                eb('u.email', 'ilike', `%${search}%`),
            ]),
        );
    }

    return query;
}

export function applyPagination<T>(query: UsersQueryBuilder<T>, args: GetUsersDataArgs) {
    return query
        .limit(args.limit ?? DEFAULT_USERS_LIMIT)
        .offset(args.offset ?? DEFAULT_USERS_OFFSET);
}
