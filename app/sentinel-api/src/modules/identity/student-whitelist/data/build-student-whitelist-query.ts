import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

export function buildStudentWhitelistQuery(dbClient: DbClient) {
    return dbClient
        .selectFrom('student_whitelist as sw')
        .innerJoin('institutions as inst', 'inst.id', 'sw.institution_id')
        .innerJoin('departments as dept', 'dept.department_id', 'sw.department_id')
        .innerJoin('courses as course', 'course.course_id', 'sw.course_id')
        .leftJoin('auth.users as claimed_user', 'claimed_user.id', 'sw.claimed_user_id')
        .leftJoin(
            'user_profiles as claimed_profile',
            'claimed_profile.user_id',
            'sw.claimed_user_id',
        )
        .select([
            'sw.whitelist_id',
            'sw.institution_id',
            'inst.name as institution_name',
            'sw.department_id',
            'dept.department_name',
            'dept.department_code',
            'sw.course_id',
            'course.title as course_title',
            'course.code as course_code',
            'sw.student_number',
            'sw.last_name',
            'sw.first_name',
            'sw.status',
            'sw.claimed_user_id',
            'sw.claimed_at',
            'sw.created_at',
            'sw.updated_at',
            'claimed_user.email as claimed_email',
            sql<
                string | null
            >`NULLIF(TRIM(CONCAT_WS(' ', claimed_profile.first_name, claimed_profile.last_name)), '')`.as(
                'claimed_name',
            ),
        ]);
}
