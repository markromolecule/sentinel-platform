import { type DbClient } from '@sentinel/db';

export type GetUsersDataArgs = {
    dbClient: DbClient;
    institutionId: string;
    search?: string;
};

export async function getUsersData({ dbClient, institutionId, search }: GetUsersDataArgs) {
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
            eb.fn.coalesce('s.student_number', 'ins.employee_number').as('identification_number'),
            eb.fn
                .coalesce(
                    eb.fn('trim', ['sd.department_name']),
                    eb.fn('trim', ['id.department_name']),
                    eb.fn('trim', ['dept.department_name']),
                )
                .as('department_name'),
            'up.institution_id',
            'up.department_id',
            'up.course_id',
            eb.ref('i.name').as('institution_name'),
            eb.ref('c.title').as('course_name'),
            'up.status',
            'up.last_seen_at',
        ]);

    if (institutionId) {
        query = query.where('up.institution_id', '=', institutionId);
    }

    // Hide superadmin role from the list
    query = query.where((eb) =>
        eb.or([eb('r.role_name', '!=', 'superadmin'), eb('r.role_name', 'is', null)]),
    );

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

    return records.map((r) => {
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

        return {
            user_id: r.user_id,
            firstName: r.first_name ?? '',
            lastName: r.last_name ?? '',
            email: r.email ?? '',
            role: r.role_name ?? metaRole,
            department: r.department_name ?? null,
            departmentId: r.department_id ?? null,
            course: r.course_name ?? null,
            courseId: r.course_id ?? null,
            studentNo: r.identification_number ?? null,
            institution: r.institution_name ?? r.institution_id ?? null,
            institutionId: r.institution_id ?? null,
            status: isOnline ? 'active' : 'offline',
            created_at: r.created_at ?? new Date(),
            updated_at: r.updated_at ?? null,
            created_by: null,
            updated_by: null,
        };
    });
}

export type GetUsersDataResponse = Awaited<ReturnType<typeof getUsersData>>;
