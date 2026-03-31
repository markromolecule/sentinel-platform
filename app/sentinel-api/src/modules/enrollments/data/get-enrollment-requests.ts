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
        .innerJoin('subjects', 'subjects.subject_id', 'subject_offerings.subject_id')
        .innerJoin('terms', 'terms.term_id', 'subject_offerings.term_id')
        .leftJoin('sections', 'sections.section_id', 'class_groups.section_id')
        .leftJoin('departments', 'departments.department_id', 'sections.department_id')
        .leftJoin('courses', 'courses.course_id', 'sections.course_id')
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
            'departments.department_name',
            'departments.department_code',
            'departments.department_id',
            'courses.title as course_title',
            'courses.code as course_code',
            'courses.course_id',
            sql<string | null>`MAX(CONCAT(user_profiles.first_name, ' ', user_profiles.last_name))`.as('instructor_name'),
            sql<string | null>`MAX(CONCAT(approver_profiles.first_name, ' ', approver_profiles.last_name))`.as('approved_by_name'),
            // Aggregate sections into a JSON array
            sql<any>`JSON_AGG(JSON_BUILD_OBJECT(
                'request_id', enrollment_requests.request_id,
                'class_group_id', enrollment_requests.class_group_id,
                'section_id', sections.section_id,
                'section_name', sections.section_name
            ))`.as('sections'),
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
            'departments.department_name',
            'departments.department_code',
            'departments.department_id',
            'courses.title',
            'courses.code',
            'courses.course_id',
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
