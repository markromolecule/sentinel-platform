import type { DbClient } from '@sentinel/db';
import { error } from 'console';
import { HTTPException } from 'hono/http-exception';
import { sql } from 'kysely';
import { supportsInstructorCourseTable } from '../helper/instructor-course-compat';

export type GetUserDataArgs = {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
    requesterRole?: string;
};

export async function getUserData({ dbClient, id, institutionId, requesterRole }: GetUserDataArgs) {
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
        .where('up.user_id', '=', id)
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
            'c.course_id as course_id',
            'c.title as primary_course_name',
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
            'dept.department_code',
            'sd.department_code',
            'id.department_code',
            'up.institution_id',
            'i.name',
            'c.course_id',
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

    if (requesterRole !== 'superadmin' && requesterRole !== 'support' && institutionId) {
        query = query.where('up.institution_id', '=', institutionId);
    }

    if (requesterRole === 'support') {
        query = query.where('r.role_name', '=', 'superadmin');
    } else if (requesterRole !== 'superadmin') {
        query = query.where((eb) =>
            eb.or([eb('r.role_name', '!=', 'superadmin'), eb('r.role_name', 'is', null)]),
        );
    }

    const record = await query.executeTakeFirst();

    if (!record) {
        throw new HTTPException(404, { message: 'User not found' });
    }

    const typedRecord = record as typeof record & {
        instructor_course_ids?: string[];
        instructor_course_names?: string[];
    };

    let metaRole = 'student';
    if (record.raw_user_meta_data) {
        try {
            const meta =
                typeof record.raw_user_meta_data === 'string'
                    ? JSON.parse(record.raw_user_meta_data)
                    : (record.raw_user_meta_data as Record<string, unknown>);

            if (meta && typeof meta === 'object' && 'role' in meta) {
                metaRole = String(meta.role);
            }
        } catch {
            error('Failed to parse metadata');
        }
    }

    // Concisely calculate online status
    const isOnline = record.last_seen_at
        ? Date.now() - new Date(record.last_seen_at).getTime() <= 5 * 60 * 1000
        : false;
    const courseIds =
        (typedRecord.instructor_course_ids ?? []).length > 0
            ? (typedRecord.instructor_course_ids ?? [])
            : typedRecord.course_id
              ? [typedRecord.course_id]
              : [];
    const courseNames =
        (typedRecord.instructor_course_names ?? []).length > 0
            ? (typedRecord.instructor_course_names ?? [])
                  .map((courseName: string) => courseName?.trim())
                  .filter(Boolean)
            : typedRecord.primary_course_name
              ? [typedRecord.primary_course_name.trim()]
              : [];

    return {
        user_id: record.user_id,
        firstName: record.first_name ?? '',
        lastName: record.last_name ?? '',
        email: record.email ?? '',
        role: record.role_name ?? metaRole,
        department: record.department_code ?? null,
        departmentCode: record.department_code ?? null,
        department_id: record.department_id ?? null,
        course: courseNames.join(', ') || null,
        course_id: record.course_id ?? courseIds[0] ?? null,
        course_ids: courseIds,
        courses: courseNames,
        studentNo: record.student_number ?? null,
        employeeNo: record.employee_number ?? null,
        institution: record.institution_name ?? null,
        institution_id: record.institution_id ?? null,
        status: isOnline ? 'active' : 'offline',
        created_at: record.created_at ?? new Date(),
        updated_at: record.updated_at ?? null,
        created_by: null,
        updated_by: null,
    };
}

export type GetUserDataResponse = Awaited<ReturnType<typeof getUserData>>;
