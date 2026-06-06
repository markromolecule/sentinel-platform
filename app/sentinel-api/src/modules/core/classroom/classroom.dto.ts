import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';

const {
    classroomFormSchema: classroomBodySchema,
    classroomUpdateFormSchema: classroomUpdateBodySchema,
} = Schema;

const classroomScopeSummarySchemaOpenApi = z.object({
    subject_label: z.string(),
    section_label: z.string(),
    term_label: z.string(),
    department_label: z.string().nullable(),
    course_label: z.string().nullable(),
    year_level_label: z.string().nullable(),
});

const classroomSummarySchemaObject = {
    class_group_id: z.string().uuid(),
    class_name: z.string().max(255).nullable(),
    is_configured: z.boolean(),
    subject_offering_id: z.string().uuid().nullable(),
    subject_id: z.string().uuid().nullable(),
    subject_code: z.string().nullable(),
    subject_title: z.string().nullable(),
    section_id: z.string().uuid().nullable(),
    section_name: z.string().nullable(),
    term_id: z.string().uuid().nullable(),
    term_academic_year: z.string().nullable(),
    term_semester: z.string().nullable(),
    department_id: z.string().uuid().nullable(),
    department_code: z.string().nullable(),
    department_name: z.string().nullable(),
    course_id: z.string().uuid().nullable(),
    course_code: z.string().nullable(),
    course_title: z.string().nullable(),
    year_level: z.number().int().nullable(),
    institution_id: z.string().uuid().nullable(),
    student_count: z.number().int().nonnegative(),
    exam_count: z.number().int().nonnegative(),
    created_at: z.union([z.coerce.date(), z.string()]).nullable(),
    updated_at: z.union([z.coerce.date(), z.string()]).nullable(),
    updated_by: z.string().uuid().nullable(),
    updated_by_name: z.string().nullable(),
    instructors: z.array(z.string()),
    scope_summary: classroomScopeSummarySchemaOpenApi,
};

export const classroomSummarySchemaOpenApi = z
    .object({
        ...classroomSummarySchemaObject,
    })
    .openapi('ClassroomSummary');

export const classroomStudentSchemaOpenApi = z
    .object({
        student_id: z.string().uuid(),
        user_id: z.string().uuid().nullable(),
        student_number: z.string(),
        first_name: z.string().nullable(),
        last_name: z.string().nullable(),
        full_name: z.string().nullable(),
        department_id: z.string().uuid().nullable(),
        department_code: z.string().nullable(),
        department_name: z.string().nullable(),
        course_id: z.string().uuid().nullable(),
        course_code: z.string().nullable(),
        course_title: z.string().nullable(),
        enrolled_at: z.union([z.coerce.date(), z.string()]).nullable(),
    })
    .openapi('ClassroomStudent');

export const classroomInstructorSchemaOpenApi = z
    .object({
        user_id: z.string().uuid(),
        name: z.string(),
        is_head: z.boolean(),
        status: z.enum(['ACTIVE', 'PENDING_ACK', 'ACKNOWLEDGED', 'FLAGGED', 'REMOVED']),
        responded_at: z.union([z.coerce.date(), z.string()]).nullable().optional(),
        justification: z.string().nullable().optional(),
        flag_reason: z.string().nullable().optional(),
        assigned_at: z.union([z.coerce.date(), z.string()]).nullable(),
        assigned_by_user_id: z.string().uuid().nullable(),
        assigned_by_name: z.string().nullable(),
    })
    .openapi('ClassroomInstructor');

export const classroomDetailSchemaOpenApi = classroomSummarySchemaOpenApi
    .extend({
        students: z.array(classroomStudentSchemaOpenApi),
    })
    .openapi('Classroom');

export const getClassroomsSchema = {
    request: {
        query: z.object({
            search: z
                .string()
                .optional()
                .openapi({ description: 'Search classrooms by name or scope' }),
            departmentId: z
                .string()
                .uuid()
                .optional()
                .openapi({ description: 'Limit classrooms to a specific department' }),
        }),
    },
    response: z.object({
        message: z.string(),
        data: z.array(classroomSummarySchemaOpenApi),
    }),
};

export const getClassroomSchema = {
    params: z.object({
        id: z.string().uuid('Invalid classroom ID format'),
    }),
    response: z.object({
        message: z.string(),
        data: classroomDetailSchemaOpenApi,
    }),
};

export const createClassroomSchema = {
    body: classroomBodySchema,
    response: z.object({
        message: z.string(),
        data: classroomDetailSchemaOpenApi,
    }),
};

export const updateClassroomSchema = {
    params: z.object({
        id: z.string().uuid('Invalid classroom ID format'),
    }),
    body: classroomUpdateBodySchema,
    response: z.object({
        message: z.string(),
        data: classroomDetailSchemaOpenApi,
    }),
};

const classroomDeleteResponseSchema = z.object({
    message: z.string(),
    data: z.null(),
});

export const deleteClassroomSchema = {
    params: z.object({
        id: z.string().uuid('Invalid classroom ID format'),
    }),
    response: classroomDeleteResponseSchema,
};

export const deleteClassroomStudentSchema = {
    params: z.object({
        id: z.string().uuid('Invalid classroom ID format'),
        studentId: z.string().uuid('Invalid student ID format'),
    }),
    response: classroomDeleteResponseSchema,
};

export const getClassroomInstructorsSchema = {
    params: z.object({
        id: z.string().uuid('Invalid classroom ID format'),
    }),
    response: z.object({
        message: z.string(),
        data: z.array(classroomInstructorSchemaOpenApi),
    }),
};

export const assignClassroomInstructorSchema = {
    params: z.object({
        id: z.string().uuid('Invalid classroom ID format'),
    }),
    body: z.object({
        instructorUserId: z.string().uuid('Invalid instructor user ID format'),
    }),
    response: z.object({
        message: z.string(),
        data: z.array(classroomInstructorSchemaOpenApi),
    }),
};

export const removeClassroomInstructorSchema = {
    params: z.object({
        id: z.string().uuid('Invalid classroom ID format'),
        userId: z.string().uuid('Invalid instructor user ID format'),
    }),
    response: classroomDeleteResponseSchema,
};

export const acknowledgeClassroomAssignmentSchema = {
    params: z.object({
        id: z.string().uuid('Invalid classroom ID format'),
    }),
    body: z.object({
        justification: z
            .string()
            .optional()
            .openapi({ description: 'Optional justification for acknowledging' }),
    }),
    response: z.object({
        message: z.string(),
        data: z.null(),
    }),
};

export const flagClassroomAssignmentSchema = {
    params: z.object({
        id: z.string().uuid('Invalid classroom ID format'),
    }),
    body: z.object({
        flagReason: z
            .string()
            .min(1, 'Flag reason is required')
            .openapi({ description: 'Reason for flagging' }),
        justification: z
            .string()
            .optional()
            .openapi({ description: 'Optional justification for flagging' }),
    }),
    response: z.object({
        message: z.string(),
        data: z.null(),
    }),
};

export const unassignedClassroomsSchema = {
    response: z.object({
        message: z.string(),
        data: z.array(
            z.object({
                class_group_id: z.string().uuid(),
                class_name: z.string().nullable(),
                subject_id: z.string().uuid().nullable(),
                subject_code: z.string().nullable(),
                subject_title: z.string().nullable(),
                section_id: z.string().uuid().nullable(),
                section_name: z.string().nullable(),
                term_id: z.string().uuid().nullable(),
            }),
        ),
    }),
};

export const instructorLoadSummarySchema = {
    request: {
        query: z.object({
            termId: z
                .string()
                .uuid()
                .optional()
                .openapi({ description: 'Filter workload counts by term' }),
        }),
    },
    response: z.object({
        message: z.string(),
        data: z.array(
            z.object({
                instructor_id: z.string().uuid(),
                user_id: z.string().uuid().nullable(),
                employee_number: z.string(),
                name: z.string(),
                department_name: z.string().nullable(),
                classroom_count: z.number().int().nonnegative(),
            }),
        ),
    }),
};

export const smartSuggestionsSchema = {
    params: z.object({
        id: z.string().uuid('Invalid classroom ID format'),
    }),
    response: z.object({
        message: z.string(),
        data: z.array(
            z.object({
                instructor_id: z.string().uuid(),
                user_id: z.string().uuid().nullable(),
                employee_number: z.string(),
                name: z.string(),
                qualification_type: z.enum(['explicit', 'derived']),
                classroom_count: z.number().int().nonnegative(),
                request_status: z.string().nullable().optional(),
                request_justification: z.string().nullable().optional(),
            }),
        ),
    }),
};

export const bulkAssignInstructorsSchema = {
    body: z.object({
        assignments: z.array(
            z.object({
                classGroupId: z.string().uuid('Invalid classroom ID format'),
                instructorUserId: z.string().uuid('Invalid instructor user ID format'),
            }),
        ),
    }),
    response: z.object({
        message: z.string(),
        data: z.array(
            z.object({
                classGroupId: z.string().uuid(),
                instructorUserId: z.string().uuid(),
                success: z.boolean(),
                error: z.string().optional(),
            }),
        ),
    }),
};

export type CreateClassroomBody = z.infer<typeof createClassroomSchema.body>;
export type UpdateClassroomBody = z.infer<typeof updateClassroomSchema.body>;
export type AssignClassroomInstructorBody = z.infer<typeof assignClassroomInstructorSchema.body>;
export type AcknowledgeClassroomAssignmentBody = z.infer<
    typeof acknowledgeClassroomAssignmentSchema.body
>;
export type FlagClassroomAssignmentBody = z.infer<typeof flagClassroomAssignmentSchema.body>;
export type BulkAssignInstructorsBody = z.infer<typeof bulkAssignInstructorsSchema.body>;
