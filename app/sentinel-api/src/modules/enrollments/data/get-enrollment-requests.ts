import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

export const getEnrollmentRequestsData = async ({
    dbClient,
    status,
    userId,
}: {
    dbClient: DbClient;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    userId?: string;
}) => {
    let query = dbClient
        .selectFrom('enrollment_requests')
        .innerJoin('class_groups', 'class_groups.class_group_id', 'enrollment_requests.class_group_id')
        .innerJoin(
            'subject_offerings',
            'subject_offerings.subject_offering_id',
            'class_groups.subject_offering_id',
        )
        .leftJoin(
            'subject_offering_departments as target_departments',
            'target_departments.subject_offering_id',
            'subject_offerings.subject_offering_id',
        )
        .leftJoin(
            'departments as target_department_records',
            'target_department_records.department_id',
            'target_departments.department_id',
        )
        .leftJoin(
            'subject_offering_courses as target_courses',
            'target_courses.subject_offering_id',
            'subject_offerings.subject_offering_id',
        )
        .leftJoin(
            'courses as target_course_records',
            'target_course_records.course_id',
            'target_courses.course_id',
        )
        .innerJoin('subjects', 'subjects.subject_id', 'subject_offerings.subject_id')
        .innerJoin('terms', 'terms.term_id', 'subject_offerings.term_id')
        .leftJoin('sections', 'sections.section_id', 'class_groups.section_id')
        .innerJoin('auth.users as users', 'users.id', 'enrollment_requests.user_id')
        .leftJoin('user_profiles', 'user_profiles.user_id', 'users.id')
        .leftJoin('user_profiles as approver_profiles', 'approver_profiles.user_id', 'enrollment_requests.approved_by')
        .select([
            'enrollment_requests.user_id',
            'enrollment_requests.status',
            sql<string>`MAX(enrollment_requests.created_at)`.as('created_at'),
            'subject_offerings.subject_offering_id',
            'subjects.subject_id',
            'subjects.subject_code',
            'subjects.subject_title',
            'terms.term_id',
            'terms.academic_year as term_academic_year',
            'terms.semester as term_semester',
            sql<string[]>`COALESCE(array_remove(array_agg(DISTINCT target_department_records.department_id), NULL), ARRAY[]::uuid[])`.as(
                'target_department_ids',
            ),
            sql<string[]>`COALESCE(array_remove(array_agg(DISTINCT target_department_records.department_name), NULL), ARRAY[]::text[])`.as(
                'target_department_names',
            ),
            sql<string[]>`COALESCE(array_remove(array_agg(DISTINCT target_department_records.department_code), NULL), ARRAY[]::text[])`.as(
                'target_department_codes',
            ),
            sql<string | null>`MIN(target_department_records.department_name)`.as(
                'department_name',
            ),
            sql<string | null>`MIN(target_department_records.department_code)`.as(
                'department_code',
            ),
            sql<string | null>`MIN(target_department_records.department_id)`.as(
                'department_id',
            ),
            sql<string[]>`COALESCE(array_remove(array_agg(DISTINCT target_course_records.course_id), NULL), ARRAY[]::uuid[])`.as(
                'target_course_ids',
            ),
            sql<string[]>`COALESCE(array_remove(array_agg(DISTINCT target_course_records.title), NULL), ARRAY[]::text[])`.as(
                'target_course_titles',
            ),
            sql<string[]>`COALESCE(array_remove(array_agg(DISTINCT target_course_records.code), NULL), ARRAY[]::text[])`.as(
                'target_course_codes',
            ),
            sql<string | null>`MIN(target_course_records.title)`.as('course_title'),
            sql<string | null>`MIN(target_course_records.code)`.as('course_code'),
            sql<string | null>`MIN(target_course_records.course_id)`.as('course_id'),
            sql<string | null>`MAX(CONCAT(user_profiles.first_name, ' ', user_profiles.last_name))`.as('instructor_name'),
            sql<string | null>`MAX(CONCAT(approver_profiles.first_name, ' ', approver_profiles.last_name))`.as('approved_by_name'),
            sql<any>`COALESCE(
                jsonb_agg(
                    DISTINCT jsonb_build_object(
                        'request_id',
                        enrollment_requests.request_id,
                        'class_group_id',
                        enrollment_requests.class_group_id,
                        'section_id',
                        sections.section_id,
                        'section_name',
                        sections.section_name
                    )
                ) FILTER (WHERE enrollment_requests.request_id IS NOT NULL),
                '[]'::jsonb
            )`.as('sections'),
        ])
        .groupBy([
            'enrollment_requests.user_id',
            'enrollment_requests.status',
            'subject_offerings.subject_offering_id',
            'subjects.subject_id',
            'subjects.subject_code',
            'subjects.subject_title',
            'terms.term_id',
            'terms.academic_year',
            'terms.semester',
        ]);

    if (status) {
        query = query.where('enrollment_requests.status', '=', status);
    }

    if (userId) {
        query = query.where('enrollment_requests.user_id', '=', userId);
    }

    return await query
        .orderBy('created_at', 'desc')
        .execute();
};
