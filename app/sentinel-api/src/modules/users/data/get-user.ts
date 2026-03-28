import type { DbClient } from '@sentinel/db';
import type { UserRole } from '@sentinel/shared/types';
import { error } from 'console';
import { HTTPException } from 'hono/http-exception';

export type GetUserDataArgs = {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
    requesterRole?: UserRole;
};

export async function getUserData({ dbClient, id, institutionId, requesterRole }: GetUserDataArgs) {
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
            eb.fn.coalesce('s.student_number', 'ins.employee_number').as('identification_number'),
            eb.fn
                .coalesce('dept.department_id', 'sd.department_id', 'id.department_id')
                .as('department_id'),
            eb.fn
                .coalesce(
                    eb.fn('trim', ['dept.department_name']),
                    eb.fn('trim', ['sd.department_name']),
                    eb.fn('trim', ['id.department_name']),
                )
                .as('department_name'),
            'up.institution_id',
            'i.name as institution_name',
            'c.course_id as course_id',
            'c.title as course_name',
            'up.status',
            'up.last_seen_at',
        ]);

    if (requesterRole !== 'superadmin' && institutionId) {
        query = query.where('up.institution_id', '=', institutionId);
    }

    if (requesterRole !== 'superadmin') {
        query = query.where((eb) =>
            eb.or([eb('r.role_name', '!=', 'superadmin'), eb('r.role_name', 'is', null)]),
        );
    }

    const record = await query.executeTakeFirst();

    if (!record) {
        throw new HTTPException(404, { message: 'User not found' });
    }

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

    return {
        user_id: record.user_id,
        firstName: record.first_name ?? '',
        lastName: record.last_name ?? '',
        email: record.email ?? '',
        role: record.role_name ?? metaRole,
        department: record.department_name ?? null,
        department_id: record.department_id ?? null,
        course: record.course_name ?? null,
        courseId: record.course_id ?? null,
        studentNo: record.identification_number ?? null,
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
