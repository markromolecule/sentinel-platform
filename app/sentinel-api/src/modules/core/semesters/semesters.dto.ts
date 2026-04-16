import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';

// Pull the shared base schema — single source of truth for field shapes & constraints
// Aliased to avoid conflict with the local response schema below
const { semesterSchema: semesterBodySchema } = Schema;

// Semester Response Schema Object (DB/API response shape — includes server-generated fields)
export const semesterSchemaObject = {
    institution_id: z.string().uuid().nullable(),
    institution_name: z.string().nullable(),
    term_id: z.string().uuid(),
    academic_year: z.string(),
    semester: z.string(),
    is_active: z.boolean().nullable(),
    start_date: z.union([z.coerce.date(), z.string()]).nullable().openapi({
        example: new Date().toISOString(),
    }),
    end_date: z.union([z.coerce.date(), z.string()]).nullable().openapi({
        example: new Date().toISOString(),
    }),
    created_at: z.union([z.coerce.date(), z.string()]).nullable().openapi({
        example: new Date().toISOString(),
    }),
    updated_at: z.union([z.coerce.date(), z.string()]).nullable().openapi({
        example: new Date().toISOString(),
    }),
};

export const semesterSchema = z.object(semesterSchemaObject);
export const semesterSchemaOpenApi = semesterSchema.openapi('Semester');

export type SemesterType = z.infer<typeof semesterSchema>;

// Get Semesters Operation
export const getSemestersSchema = {
    request: {
        query: z.object({
            search: z.string().optional().openapi({ description: 'Search term' }),
            institutionId: z
                .string()
                .uuid()
                .optional()
                .openapi({ description: 'Filter by institution ID' }),
        }),
    },
    response: z.object({
        message: z.string(),
        data: z.array(semesterSchemaOpenApi),
    }),
};

// Create Semester Operation — body derived from shared schema
export const createSemesterSchema = {
    body: semesterBodySchema,
    response: z.object({
        message: z.string(),
        data: semesterSchemaOpenApi,
    }),
};

// Update Semester Operation — partial of shared schema (all fields optional)
export const updateSemesterSchema = {
    params: z.object({
        id: z.string().uuid('Invalid semester ID format'),
    }),
    body: semesterBodySchema.partial(),
    response: z.object({
        message: z.string(),
        data: semesterSchemaOpenApi,
    }),
};

// Delete Semester Operation
export const deleteSemesterSchema = {
    params: z.object({
        id: z.string().uuid('Invalid semester ID format'),
    }),
    response: z.object({
        message: z.string(),
        data: z.null(),
    }),
};

// Type Exports
export type GetSemestersResponse = z.infer<typeof getSemestersSchema.response>;

// Create Semester Operation Types
export type CreateSemesterBody = z.infer<typeof createSemesterSchema.body>;
export type CreateSemesterResponse = z.infer<typeof createSemesterSchema.response>;

// Update Semester Operation Types
export type UpdateSemesterParams = z.infer<typeof updateSemesterSchema.params>;
export type UpdateSemesterBody = z.infer<typeof updateSemesterSchema.body>;
export type UpdateSemesterResponse = z.infer<typeof updateSemesterSchema.response>;

// Delete Semester Operation Types
export type DeleteSemesterParams = z.infer<typeof deleteSemesterSchema.params>;
export type DeleteSemesterResponse = z.infer<typeof deleteSemesterSchema.response>;
