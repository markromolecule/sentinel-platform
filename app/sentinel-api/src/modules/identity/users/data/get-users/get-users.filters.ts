import {
    DEFAULT_USERS_LIMIT,
    DEFAULT_USERS_OFFSET,
    type GetUsersDataArgs,
    INSTRUCTOR_ROLE_NAME,
    SUPERADMIN_ROLE_NAME,
    type UsersQueryBuilder,
} from './get-users.types';

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
        return query.where((eb) =>
            eb.or([
                eb('r.role_name', '!=', SUPERADMIN_ROLE_NAME),
                eb('r.role_name', 'is', null),
            ]),
        );
    }

    if (requesterRole === 'instructor') {
        return query
            .where('r.role_name', '=', 'student')
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
    const { institutionId, roleFilter, search } = args;

    if (institutionId) {
        query = query.where('up.institution_id', '=', institutionId);
    }

    if (roleFilter) {
        if (roleFilter === INSTRUCTOR_ROLE_NAME) {
            query = query.where('r.role_name', '=', INSTRUCTOR_ROLE_NAME);
        } else if (roleFilter === 'student') {
            query = query.where((eb) =>
                eb.or([eb('r.role_name', '=', 'student'), eb('s.user_id', 'is not', null)]),
            );
        } else {
            query = query.where('r.role_name', '=', roleFilter);
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
