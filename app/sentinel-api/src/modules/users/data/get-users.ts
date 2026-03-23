import type { DbClient } from '@sentinel/db';
import { sql } from 'kysely';

export type GetUsersDataArgs = {
    dbClient: DbClient;
    institutionId: string;
};

export async function getUsersData({ dbClient, institutionId }: GetUsersDataArgs) {
    let query = dbClient
        .selectFrom('user_profiles as up')
        .innerJoin('auth.users as u', 'u.id', 'up.user_id')
        .leftJoin('students as s', 's.user_id', 'up.user_id')
        .leftJoin('departments as d', 'd.department_id', 's.department_id')
        .leftJoin('institutions as i', 'i.id', 'up.institution_id')
        .leftJoin('user_roles as ur', 'ur.user_id', 'up.user_id')
        .leftJoin('roles as r', 'r.role_id', 'ur.role_id')
        .select([
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
        ] as const);

    if (institutionId) {
        query = query.where('up.institution_id', '=', institutionId);
    }

    const records = await query.orderBy('up.last_name', 'asc').execute();

    return records.map((r: any) => {
        let metaRole = null;
        if (typeof r.raw_user_meta_data === 'string') {
            try {
                metaRole = JSON.parse(r.raw_user_meta_data).role;
            } catch (e) {}
        } else if (r.raw_user_meta_data) {
            metaRole = r.raw_user_meta_data.role;
        }

        const now = new Date();
        const lastSeen = r.last_seen_at ? new Date(r.last_seen_at) : null;
        let isOnline = false;
        if (lastSeen && now.getTime() - lastSeen.getTime() <= 5 * 60 * 1000) {
            isOnline = true;
        }

        return {
            user_id: r.user_id,
            firstName: r.first_name ?? '',
            lastName: r.last_name ?? '',
            email: r.email ?? '',
            role: r.role_name ?? metaRole ?? 'student',
            department: r.department_name ?? null,
            studentNo: r.student_number ?? null,
            institution: r.institution_name ?? null,
            status: isOnline ? 'ACTIVE' : 'OFFLINE',
            created_at: r.created_at ?? new Date(),
            updated_at: r.updated_at ?? null,
            created_by: null,
            updated_by: null,
        };
    });
}

export type GetUsersDataResponse = Awaited<ReturnType<typeof getUsersData>>;
