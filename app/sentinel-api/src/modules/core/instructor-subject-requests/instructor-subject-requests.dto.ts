import { z } from '@hono/zod-openapi';

export const instructorSubjectRequestSchemaOpenApi = z
    .object({
        request_id: z.string().uuid(),
        instructor_id: z.string().uuid(),
        instructor_user_id: z.string().uuid(),
        instructor_name: z.string(),
        subject_id: z.string().uuid(),
        subject_code: z.string(),
        subject_title: z.string(),
        status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'WAITLISTED', 'CANCELLED']),
        justification: z.string().nullable().optional(),
        reviewer_user_id: z.string().uuid().nullable().optional(),
        reviewer_name: z.string().nullable().optional(),
        reviewed_at: z.union([z.coerce.date(), z.string()]).nullable().optional(),
        review_comments: z.string().nullable().optional(),
        created_at: z.union([z.coerce.date(), z.string()]).nullable(),
        updated_at: z.union([z.coerce.date(), z.string()]).nullable(),
    })
    .openapi('InstructorSubjectRequest');

export const submitSubjectRequestSchema = {
    body: z.object({
        subjectId: z.string().uuid('Invalid subject ID format'),
        justification: z
            .string()
            .optional()
            .openapi({ description: 'Justification for requesting this subject' }),
    }),
    response: z.object({
        message: z.string(),
        data: instructorSubjectRequestSchemaOpenApi,
    }),
};

export const reviewSubjectRequestSchema = {
    params: z.object({
        id: z.string().uuid('Invalid request ID format'),
    }),
    body: z.object({
        status: z.enum(['APPROVED', 'REJECTED', 'WAITLISTED']),
        reviewComments: z.string().optional().openapi({ description: 'Review remarks/comments' }),
    }),
    response: z.object({
        message: z.string(),
        data: instructorSubjectRequestSchemaOpenApi,
    }),
};

export const cancelSubjectRequestSchema = {
    params: z.object({
        id: z.string().uuid('Invalid request ID format'),
    }),
    response: z.object({
        message: z.string(),
        data: z.null(),
    }),
};

export const listSubjectRequestsSchema = {
    request: {
        query: z.object({
            status: z
                .enum(['PENDING', 'APPROVED', 'REJECTED', 'WAITLISTED', 'CANCELLED'])
                .optional()
                .openapi({ description: 'Filter requests by status' }),
        }),
    },
    response: z.object({
        message: z.string(),
        data: z.array(instructorSubjectRequestSchemaOpenApi),
    }),
};

export const qualifiedInstructorSchemaOpenApi = z
    .object({
        instructor_id: z.string().uuid(),
        user_id: z.string().uuid(),
        employee_number: z.string(),
        name: z.string(),
        qualification_type: z.enum(['explicit', 'derived']),
    })
    .openapi('QualifiedInstructor');

export const assignQualificationSchema = {
    body: z.object({
        instructorId: z.string().uuid('Invalid instructor ID format'),
        subjectId: z.string().uuid('Invalid subject ID format'),
    }),
    response: z.object({
        message: z.string(),
        data: z.null(),
    }),
};

export const revokeQualificationSchema = {
    params: z.object({
        instructorId: z.string().uuid('Invalid instructor ID format'),
        subjectId: z.string().uuid('Invalid subject ID format'),
    }),
    response: z.object({
        message: z.string(),
        data: z.null(),
    }),
};

export const listQualifiedInstructorsSchema = {
    params: z.object({
        subjectId: z.string().uuid('Invalid subject ID format'),
    }),
    response: z.object({
        message: z.string(),
        data: z.array(qualifiedInstructorSchemaOpenApi),
    }),
};

export type SubmitSubjectRequestBody = z.infer<typeof submitSubjectRequestSchema.body>;
export type ReviewSubjectRequestBody = z.infer<typeof reviewSubjectRequestSchema.body>;
export type AssignQualificationBody = z.infer<typeof assignQualificationSchema.body>;
