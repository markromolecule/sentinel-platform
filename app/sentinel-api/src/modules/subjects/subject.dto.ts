import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';

const { subjectFormSchema: subjectBodySchema } = Schema;

export const subjectSchemaObject = {
    subject_id: z.string().uuid(),
    subject_code: z.string().max(50).openapi({ example: 'INF231' }),
    subject_title: z.string().max(255).openapi({ example: 'Introduction to Computing' }),
    department_ids: z.array(z.string().uuid()).openapi({
        example: ['123e4567-e89b-12d3-a456-426614174000'],
    }),
    course_ids: z.array(z.string().uuid()).openapi({
        example: ['123e4567-e89b-12d3-a456-426614174001'],
    }),
    section_ids: z.array(z.string().uuid()).openapi({
        example: ['123e4567-e89b-12d3-a456-426614174002'],
    }),
    year_levels: z.array(z.number().int()).openapi({
        example: [1, 2],
    }),
    created_at: z
        .union([z.coerce.date(), z.string()])
        .nullable()
        .openapi({ example: new Date().toISOString() }),
    updated_at: z.union([z.coerce.date(), z.string()]).nullable(),
    created_by: z.string().nullable(),
    updated_by: z.string().nullable(),
};

export const subjectSchemaOpenApi = z.object(subjectSchemaObject).openapi('Subject');

export type SubjectType = z.infer<typeof subjectSchemaOpenApi>;

export const getSubjectsSchema = {
    response: z.object({
        message: z.string(),
        data: z.array(subjectSchemaOpenApi),
    }),
};

export type GetSubjectsResponse = z.infer<typeof getSubjectsSchema.response>;

export const createSubjectSchema = {
    body: subjectBodySchema,
    response: z.object({
        message: z.string(),
        data: subjectSchemaOpenApi,
    }),
};

export type CreateSubjectBody = z.infer<typeof createSubjectSchema.body>;
export type CreateSubjectResponse = z.infer<typeof createSubjectSchema.response>;

export const updateSubjectSchema = {
    params: z.object({
        id: z.string().uuid('Invalid subject ID format'),
    }),
    body: subjectBodySchema.partial(),
    response: z.object({
        message: z.string(),
        data: subjectSchemaOpenApi,
    }),
};

export type UpdateSubjectParams = z.infer<typeof updateSubjectSchema.params>;
export type UpdateSubjectBody = z.infer<typeof updateSubjectSchema.body>;
export type UpdateSubjectResponse = z.infer<typeof updateSubjectSchema.response>;

export const deleteSubjectSchema = {
    params: z.object({
        id: z.string().uuid('Invalid subject ID format'),
    }),
    response: z.object({
        message: z.string(),
        data: z.null(),
    }),
};

export type DeleteSubjectParams = z.infer<typeof deleteSubjectSchema.params>;
export type DeleteSubjectResponse = z.infer<typeof deleteSubjectSchema.response>;
