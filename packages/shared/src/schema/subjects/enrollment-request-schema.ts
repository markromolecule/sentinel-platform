import * as z from 'zod';

// Item in the array for getEnrolledSubjectsResponse
export const instructorEnrolledSubjectSchema = z.object({
    subject_offering_id: z.string().uuid(),
    subject_id: z.string().uuid(),
    code: z.string(),
    title: z.string(),
    term_id: z.string().uuid(),
    term_academic_year: z.string(),
    term_semester: z.string(),
    department_ids: z.array(z.string().uuid()),
    department_codes: z.array(z.string()),
    department_code: z.string().nullable(),
    course_ids: z.array(z.string().uuid()),
    course_codes: z.array(z.string()),
    course_code: z.string().nullable(),
    year_levels: z.array(z.number().int()),
    sections: z.array(
        z.object({
            id: z.string().uuid(),
            name: z.string(),
            year_level: z.number().int().nullable().optional(),
        }),
    ),
    requested_at: z.union([z.coerce.date(), z.string()]).nullable(),
    approved_at: z.union([z.coerce.date(), z.string()]).nullable(),
    approved_by_name: z.string().nullable(),
});

// Item in the array for getEnrollmentRequestsResponse
export const enrollmentRequestSchema = z.object({
    user_id: z.string().uuid(),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
    created_at: z.union([z.coerce.date(), z.string()]).nullable(),
    instructor_name: z.string().nullable(),
    subject_offering_id: z.string().uuid(),
    subject_id: z.string().uuid(),
    subject_code: z.string(),
    subject_title: z.string(),
    term_id: z.string().uuid(),
    term_academic_year: z.string(),
    term_semester: z.string(),
    target_department_ids: z.array(z.string().uuid()),
    target_department_names: z.array(z.string()),
    target_department_codes: z.array(z.string()),
    department_name: z.string().nullable(),
    department_code: z.string().nullable(),
    department_id: z.string().uuid().nullable(),
    target_course_ids: z.array(z.string().uuid()),
    target_course_titles: z.array(z.string()),
    target_course_codes: z.array(z.string()),
    target_year_levels: z.array(z.number().int()),
    course_title: z.string().nullable(),
    course_code: z.string().nullable(),
    course_id: z.string().uuid().nullable(),
    resolved_section_count: z.number().int().nonnegative(),
    sections: z.array(
        z.object({
            request_id: z.string().uuid(),
            class_group_id: z.string().uuid(),
            section_id: z.string().uuid().nullable(),
            section_name: z.string().nullable(),
        }),
    ),
});

// Body for approve/reject enrollment requests
export const enrollmentRequestActionSchema = z.object({
    request_ids: z.array(z.string().uuid()).min(1),
});

// Params for unenrollment
export const unenrollInstructorParamsSchema = z.object({
    id: z.string().uuid('Invalid subject ID format'),
});

export const unenrollInstructorQuerySchema = z.object({
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
    class_group_ids: z
        .union([z.string().uuid(), z.array(z.string().uuid())])
        .optional()
        .transform((val) => {
            if (!val) return undefined;
            return Array.isArray(val) ? val : [val];
        }),
});
