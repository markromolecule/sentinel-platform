import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';

const {
    enrollSubjectSchema: enrollBodySchema,
    instructorEnrolledSubjectSchema,
    enrollmentRequestSchema,
    enrollmentRequestActionSchema,
    unenrollInstructorParamsSchema,
    unenrollInstructorQuerySchema,
} = Schema;

// --- Instructor Subjects / Enrollment Schemas ---
export const enrollInstructorSubjectSchema = {
    body: enrollBodySchema,
    response: z.object({
        message: z.string(),
        data: z.object({
            classGroupIds: z
                .array(z.string().uuid())
                .openapi({ description: 'Created or assigned class_group_ids' }),
            newRequestsCount: z.number().int().min(0),
            existingRequestsCount: z.number().int().min(0),
            existingRolesCount: z.number().int().min(0),
            total: z.number().int().min(0),
        }),
    }),
};

export type EnrollInstructorSubjectBody = z.infer<typeof enrollInstructorSubjectSchema.body>;
export type EnrollInstructorSubjectResponse = z.infer<
    typeof enrollInstructorSubjectSchema.response
>;

export const getEnrolledSubjectsSchema = {
    query: z.object({
        search: z
            .string()
            .optional()
            .openapi({ description: 'Search term for subject code or title' }),
    }),
    response: z.object({
        message: z.string(),
        data: z.array(instructorEnrolledSubjectSchema).openapi('InstructorEnrolledSubject'),
    }),
};

export type GetEnrolledSubjectsResponse = z.infer<typeof getEnrolledSubjectsSchema.response>;

// --- Admin Enrollment Requests Schemas ---

export const getEnrollmentRequestsSchema = {
    query: z.object({
        status: z
            .enum(['PENDING', 'APPROVED', 'REJECTED'])
            .optional()
            .openapi({ description: 'Filter by status' }),
    }),
    response: z.object({
        message: z.string(),
        data: z.array(enrollmentRequestSchema).openapi('EnrollmentRequest'),
    }),
};

export type GetEnrollmentRequestsQuery = z.infer<typeof getEnrollmentRequestsSchema.query>;
export type GetEnrollmentRequestsResponse = z.infer<typeof getEnrollmentRequestsSchema.response>;

export const approveEnrollmentRequestSchema = {
    body: enrollmentRequestActionSchema,
    response: z.object({
        message: z.string(),
        data: z.array(
            z.object({
                class_group_id: z.string().uuid(),
                user_id: z.string().uuid(),
            }),
        ),
    }),
};

export type ApproveEnrollmentRequestBody = z.infer<typeof approveEnrollmentRequestSchema.body>;
export type ApproveEnrollmentRequestResponse = z.infer<
    typeof approveEnrollmentRequestSchema.response
>;

export const rejectEnrollmentRequestSchema = {
    body: enrollmentRequestActionSchema,
    response: z.object({
        message: z.string(),
        data: z.array(z.string().uuid()),
    }),
};

export type RejectEnrollmentRequestBody = z.infer<typeof rejectEnrollmentRequestSchema.body>;
export type RejectEnrollmentRequestResponse = z.infer<
    typeof rejectEnrollmentRequestSchema.response
>;

export const unapproveEnrollmentRequestSchema = {
    body: enrollmentRequestActionSchema,
    response: z.object({
        message: z.string(),
        data: z.array(z.string().uuid()),
    }),
};

export type UnapproveEnrollmentRequestBody = z.infer<
    typeof unapproveEnrollmentRequestSchema.body
>;
export type UnapproveEnrollmentRequestResponse = z.infer<
    typeof unapproveEnrollmentRequestSchema.response
>;

export const deleteEnrollmentRequestsSchema = {
    body: enrollmentRequestActionSchema,
    response: z.object({
        message: z.string(),
        data: z.object({
            deleted_count: z.number().int().min(0),
        }),
    }),
};

export type DeleteEnrollmentRequestsBody = z.infer<typeof deleteEnrollmentRequestsSchema.body>;
export type DeleteEnrollmentRequestsResponse = z.infer<
    typeof deleteEnrollmentRequestsSchema.response
>;

export const unenrollInstructorSubjectSchema = {
    params: unenrollInstructorParamsSchema,
    query: unenrollInstructorQuerySchema,
    response: z.object({
        message: z.string(),
        data: z.null(),
    }),
};

export type UnenrollInstructorSubjectParams = z.infer<
    typeof unenrollInstructorSubjectSchema.params
>;
export type UnenrollInstructorSubjectResponse = z.infer<
    typeof unenrollInstructorSubjectSchema.response
>;
