import type { DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';

export type GetUserDataArgs = {
    dbClient: DbClient;
    id: string;
    institutionId: string;
};

export async function getUserData({ dbClient, id, institutionId }: GetUserDataArgs) {
    const record = await dbClient
        .selectFrom('user_profiles as up')
        .innerJoin('auth.users as u', 'u.id', 'up.user_id')
        .leftJoin('students as s', 's.user_id', 'up.user_id')
        .leftJoin('departments as d', 'd.department_id', 's.department_id')
        .leftJoin('institutions as i', 'i.id', 'up.institution_id')
        .leftJoin('user_roles as ur', 'ur.user_id', 'up.user_id')
        .leftJoin('roles as r', 'r.role_id', 'ur.role_id')
        .where('up.user_id', '=', id)
        .where('up.institution_id', '=', institutionId)
        .select(
            () =>
                [
                    'up.user_id',
                    'up.first_name',
                    'up.last_name',
                    'up.created_at',
                    'up.updated_at',
                    'u.email',
                    'u.raw_user_meta_data',
                    'r.role_name',
                    's.student_number',
                    'd.department_name',
                    'i.name as institution_name',
                    'up.status',
                    'up.last_seen_at',
                ] as const,
        )
        .executeTakeFirst();

    if (!record) {
        throw new HTTPException(404, { message: 'User not found' });
    }

    let metaRole = null;
    if (typeof (record.raw_user_meta_data as any) === 'string') {
        try {
            metaRole = JSON.parse(record.raw_user_meta_data as any).role;
        } catch (e) {}
    } else if (record.raw_user_meta_data) {
        metaRole = (record.raw_user_meta_data as any).role;
    }

    const now = new Date();
    const lastSeen = record.last_seen_at ? new Date(record.last_seen_at) : null;
    let isOnline = false;
    if (lastSeen && now.getTime() - lastSeen.getTime() <= 5 * 60 * 1000) {
        isOnline = true;
    }

    return {
        user_id: record.user_id,
        firstName: record.first_name ?? '',
        lastName: record.last_name ?? '',
        email: record.email ?? '',
        role: record.role_name ?? metaRole ?? 'student',
        department: record.department_name ?? null,
        studentNo: record.student_number ?? null,
        institution: record.institution_name ?? null,
        status: isOnline ? 'ACTIVE' : 'OFFLINE',
        created_at: record.created_at ?? new Date(),
        updated_at: record.updated_at ?? null,
        created_by: null,
        updated_by: null,
    };
}

export type GetUserDataResponse = Awaited<ReturnType<typeof getUserData>>;
