import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';
import { supportsInstructorCourseTable } from '../helper/instructor-course-compat';

export type GetUsersDataArgs = {
    dbClient: DbClient;
    institutionId?: string;
    search?: string;
    requesterRole?: string;
};

export async function getUsersData({
    dbClient,
    institutionId,
    search,
    requesterRole,
}: GetUsersDataArgs) {
    const supportsInstructorCourses = await supportsInstructorCourseTable(dbClient);

    let query = dbClient
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
            's.student_number',
            'ins.employee_number',
            eb.fn
                .coalesce(
                    eb.fn('trim', ['sd.department_code']),
                    eb.fn('trim', ['id.department_code']),
                    eb.fn('trim', ['dept.department_code']),
                )
                .as('department_code'),
            'up.institution_id',
            'up.department_id',
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
            'sd.department_code',
            'id.department_code',
            'dept.department_code',
            'up.institution_id',
            'up.department_id',
            'up.course_id',
            'i.name',
            'c.title',
            'up.status',
            'up.last_seen_at',
        ]);

    if (supportsInstructorCourses) {
        query = query
            .leftJoin('instructor_courses as ic', 'ic.instructor_id', 'ins.instructor_id')
            .leftJoin('courses as icc', 'icc.course_id', 'ic.course_id')
            .select([
                sql<string[]>`COALESCE(array_remove(array_agg(DISTINCT ic.course_id), NULL), ARRAY[]::uuid[])`.as(
                    'instructor_course_ids',
                ),
                sql<string[]>`COALESCE(array_remove(array_agg(DISTINCT icc.title), NULL), ARRAY[]::text[])`.as(
                    'instructor_course_names',
                ),
            ]);
    } else {
        query = query.select([
            sql<string[]>`ARRAY[]::uuid[]`.as('instructor_course_ids'),
            sql<string[]>`ARRAY[]::text[]`.as('instructor_course_names'),
        ]);
    }

    if (institutionId) {
        query = query.where('up.institution_id', '=', institutionId);
    }

    if (requesterRole === 'support') {
        query = query.where('r.role_name', '=', 'superadmin');
    } else {
        query = query.where((eb) =>
            eb.or([eb('r.role_name', '!=', 'superadmin'), eb('r.role_name', 'is', null)]),
        );
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

    const records = await query.orderBy('up.last_name', 'asc').execute();
    const nowMs = Date.now();
    const FIVE_MINUTES_MS = 5 * 60 * 1000;

    return records.map((record) => {
        const r = record as typeof record & {
            instructor_course_ids?: string[];
            instructor_course_names?: string[];
        };

        let metaRole = 'student';
        if (r.raw_user_meta_data) {
            try {
                const meta =
                    typeof r.raw_user_meta_data === 'string'
                        ? JSON.parse(r.raw_user_meta_data)
                        : (r.raw_user_meta_data as Record<string, unknown>);

                if (meta && typeof meta === 'object' && 'role' in meta) {
                    metaRole = String(meta.role);
                }
            } catch {
                throw new Error('Failed to parse metadata');
            }
        }

        const isOnline = r.last_seen_at
            ? nowMs - new Date(r.last_seen_at).getTime() <= FIVE_MINUTES_MS
            : false;
        const courseIds =
            (r.instructor_course_ids ?? []).length > 0
                ? (r.instructor_course_ids ?? [])
                : r.course_id
                  ? [r.course_id]
                  : [];
        const courseNames =
            (r.instructor_course_names ?? []).length > 0
                ? (r.instructor_course_names ?? [])
                      .map((courseName: string) => courseName?.trim())
                      .filter(Boolean)
                : r.primary_course_name
                  ? [r.primary_course_name.trim()]
                  : [];

        return {
            user_id: r.user_id,
            firstName: r.first_name ?? '',
            lastName: r.last_name ?? '',
            email: r.email ?? '',
            role: r.role_name ?? metaRole,
            department: r.department_code ?? null,
            departmentCode: r.department_code ?? null,
            department_id: r.department_id ?? null,
            course: courseNames.join(', ') || null,
            course_id: r.course_id ?? courseIds[0] ?? null,
            course_ids: courseIds,
            courses: courseNames,
            studentNo: r.student_number ?? null,
            employeeNo: r.employee_number ?? null,
            institution: r.institution_name ?? r.institution_id ?? null,
            institution_id: r.institution_id ?? null,
            status: isOnline ? 'active' : 'offline',
            created_at: r.created_at ?? new Date(),
            updated_at: r.updated_at ?? null,
            created_by: null,
            updated_by: null,
        };
    });
}

export type GetUsersDataResponse = Awaited<ReturnType<typeof getUsersData>>;
