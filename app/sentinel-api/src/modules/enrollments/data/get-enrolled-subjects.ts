import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

export const getEnrolledSubjectsData = async ({
    dbClient,
    userId,
    search,
}: {
    dbClient: DbClient;
    userId: string;
    search?: string;
}) => {
    let query = dbClient
        .selectFrom('class_roles')
        .innerJoin('class_groups', 'class_groups.class_group_id', 'class_roles.class_group_id')
        .innerJoin('subjects', 'subjects.subject_id', 'class_groups.subject_id')
        .leftJoin('sections', 'sections.section_id', 'class_groups.section_id')
        .leftJoin('departments', 'departments.department_id', 'sections.department_id')
        .leftJoin('courses', 'courses.course_id', 'sections.course_id')
        .leftJoin('enrollment_requests', (join) =>
            join
                .onRef('enrollment_requests.class_group_id', '=', 'class_roles.class_group_id')
                .onRef('enrollment_requests.user_id', '=', 'class_roles.user_id')
                .on('enrollment_requests.status', '=', 'APPROVED'),
        )
        .leftJoin('user_profiles as approver_profiles', (join) =>
            join.onRef('approver_profiles.user_id', '=', 'enrollment_requests.approved_by'),
        )
        .select([
            'subjects.subject_id',
            'subjects.subject_code as code',
            'subjects.subject_title as title',
            'departments.department_code',
            'courses.code as course_code',
            sql<any>`json_agg(json_build_object('id', class_groups.class_group_id, 'name', sections.section_name))`.as(
                'sections',
            ),
            sql<string>`MAX(enrollment_requests.created_at)`.as('requested_at'),
            sql<string>`MAX(enrollment_requests.updated_at)`.as('approved_at'),
            sql<
                string | null
            >`MAX(NULLIF(TRIM(concat_ws(' ', approver_profiles.first_name, approver_profiles.last_name)), ''))`.as(
                'approved_by_name',
            ),
        ])
        .where('class_roles.user_id', '=', userId)
        .innerJoin('roles', 'roles.role_id', 'class_roles.role_id')
        .where('roles.role_name', '=', 'instructor');

    if (search) {
        query = query.where((eb) =>
            eb.or([
                eb('subjects.subject_code', 'ilike', `%${search}%`),
                eb('subjects.subject_title', 'ilike', `%${search}%`),
            ]),
        );
    }

    return await query
        .groupBy([
            'subjects.subject_id',
            'subjects.subject_code',
            'subjects.subject_title',
            'departments.department_code',
            'courses.code',
        ])
        .orderBy('subjects.subject_code', 'asc')
        .execute();
};
