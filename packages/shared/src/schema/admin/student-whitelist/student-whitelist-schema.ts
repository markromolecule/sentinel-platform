import * as z from 'zod';

export const studentWhitelistStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']);

export const studentWhitelistRecordSchema = z.object({
    whitelist_id: z.string().uuid(),
    institution_id: z.string().uuid(),
    institution_name: z.string().nullable(),
    department_id: z.string().uuid(),
    department_name: z.string().nullable(),
    department_code: z.string().nullable(),
    course_id: z.string().uuid(),
    course_title: z.string().nullable(),
    course_code: z.string().nullable(),
    student_number: z.string().max(50),
    last_name: z.string().max(100),
    first_name: z.string().max(100).nullable(),
    status: studentWhitelistStatusSchema,
    claimed_user_id: z.string().uuid().nullable(),
    claimed_at: z.union([z.coerce.date(), z.string()]).nullable(),
    claimed_email: z.string().email().nullable(),
    claimed_name: z.string().nullable(),
    created_at: z.union([z.coerce.date(), z.string()]).nullable(),
    updated_at: z.union([z.coerce.date(), z.string()]).nullable(),
});

export const getStudentWhitelistQuerySchema = z.object({
    search: z.string().optional(),
    institution_id: z.string().uuid().optional(),
    department_id: z.string().uuid().optional(),
    course_id: z.string().uuid().optional(),
    status: studentWhitelistStatusSchema.optional(),
});

export const createStudentWhitelistSchema = z.object({
    institution_id: z.string().uuid('Invalid institution ID format').optional(),
    department_id: z.string().uuid('Invalid department ID format'),
    course_id: z.string().uuid('Invalid course ID format'),
    student_number: z.string().min(1, 'Student number is required').max(50),
    last_name: z.string().min(1, 'Last name is required').max(100),
    first_name: z.string().max(100).optional().nullable(),
    status: studentWhitelistStatusSchema.optional(),
});

export const studentWhitelistFormSchema = createStudentWhitelistSchema.extend({
    institution_id: z.string().uuid('Please select an institution'),
    status: studentWhitelistStatusSchema,
});

export const updateStudentWhitelistParamsSchema = z.object({
    id: z.string().uuid('Invalid whitelist ID format'),
});

export const deleteStudentWhitelistParamsSchema = updateStudentWhitelistParamsSchema;

export const updateStudentWhitelistSchema = z.object({
    institution_id: z.string().uuid('Invalid institution ID format').optional(),
    department_id: z.string().uuid('Invalid department ID format').optional(),
    course_id: z.string().uuid('Invalid course ID format').optional(),
    student_number: z.string().min(1, 'Student number is required').max(50).optional(),
    last_name: z.string().min(1, 'Last name is required').max(100).optional(),
    first_name: z.string().max(100).optional().nullable(),
    status: studentWhitelistStatusSchema.optional(),
});

export const studentWhitelistBulkImportRowSchema = z.object({
    row_number: z.number().int().positive(),
    student_number: z.string().min(1).max(50),
    last_name: z.string().min(1).max(100),
    first_name: z.string().max(100).optional().nullable(),
    status: studentWhitelistStatusSchema.optional(),
    source_course: z.string().max(100).optional().nullable(),
});

export const bulkImportStudentWhitelistSchema = z.object({
    institution_id: z.string().uuid('Invalid institution ID format').optional(),
    department_id: z.string().uuid('Invalid department ID format'),
    course_id: z.string().uuid('Invalid course ID format'),
    rows: z.array(studentWhitelistBulkImportRowSchema).min(1).max(1000),
});

export const studentWhitelistBulkImportFailureSchema = z.object({
    row_number: z.number().int().positive(),
    student_number: z.string().nullable(),
    last_name: z.string().nullable(),
    source_course: z.string().nullable(),
    error: z.string(),
});

export const studentWhitelistBulkImportResultSchema = z.object({
    total_rows: z.number().int().nonnegative(),
    created_count: z.number().int().nonnegative(),
    failed_count: z.number().int().nonnegative(),
    failures: z.array(studentWhitelistBulkImportFailureSchema),
});

export const purgeStudentWhitelistSchema = z.object({
    institution_id: z.string().uuid('Invalid institution ID format').optional(),
    department_id: z.string().uuid('Invalid department ID format').optional(),
    course_id: z.string().uuid('Invalid course ID format').optional(),
    status: studentWhitelistStatusSchema.optional(),
    include_claimed: z.boolean().optional().default(false),
});

export const purgeStudentWhitelistResultSchema = z.object({
    deleted_count: z.number().int().nonnegative(),
    skipped_claimed_count: z.number().int().nonnegative(),
});

export type GetStudentWhitelistQueryValues = z.infer<typeof getStudentWhitelistQuerySchema>;
export type CreateStudentWhitelistSchemaValues = z.infer<typeof createStudentWhitelistSchema>;
export type StudentWhitelistFormValues = z.infer<typeof studentWhitelistFormSchema>;
export type UpdateStudentWhitelistParamsValues = z.infer<typeof updateStudentWhitelistParamsSchema>;
export type DeleteStudentWhitelistParamsValues = z.infer<typeof deleteStudentWhitelistParamsSchema>;
export type UpdateStudentWhitelistSchemaValues = z.infer<typeof updateStudentWhitelistSchema>;
export type StudentWhitelistBulkImportRowValues = z.infer<
    typeof studentWhitelistBulkImportRowSchema
>;
export type BulkImportStudentWhitelistSchemaValues = z.infer<
    typeof bulkImportStudentWhitelistSchema
>;
export type StudentWhitelistBulkImportFailureValues = z.infer<
    typeof studentWhitelistBulkImportFailureSchema
>;
export type StudentWhitelistBulkImportResultValues = z.infer<
    typeof studentWhitelistBulkImportResultSchema
>;
export type PurgeStudentWhitelistSchemaValues = z.infer<typeof purgeStudentWhitelistSchema>;
export type PurgeStudentWhitelistResultValues = z.infer<
    typeof purgeStudentWhitelistResultSchema
>;
