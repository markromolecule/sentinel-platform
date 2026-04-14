import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';
import { subjectClassificationSummarySchemaOpenApi } from '../subject-classification/subject-classification.dto';

const { subjectFormSchema: subjectBodySchema, subjectUpdateFormSchema: subjectUpdateBodySchema } =
    Schema;

export const subjectSchemaObject = {
    subject_id: z.string().uuid(),
    subject_code: z.string().max(50).openapi({ example: 'INF231' }),
    subject_title: z.string().max(255).openapi({ example: 'Introduction to Computing' }),
    term_id: z.string().uuid().nullable().openapi({
        example: '123e4567-e89b-12d3-a456-426614174003',
    }),
    is_opened: z.boolean().nullable().openapi({ example: true }),
    offering_start_date: z
        .union([z.coerce.date(), z.string()])
        .nullable()
        .openapi({ example: new Date().toISOString() }),
    offering_end_date: z
        .union([z.coerce.date(), z.string()])
        .nullable()
        .openapi({ example: new Date().toISOString() }),
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
    classifications: z.array(subjectClassificationSummarySchemaOpenApi).openapi({
        example: [
            {
                id: '123e4567-e89b-12d3-a456-426614174009',
                name: 'General Subjects',
                type: 'GENERAL',
            },
        ],
    }),
};

export const subjectSchemaOpenApi = z.object(subjectSchemaObject).openapi('Subject');

export type SubjectType = z.infer<typeof subjectSchemaOpenApi>;

export const getSubjectsSchema = {
    request: {
        query: z.object({
            search: z.string().optional().openapi({ description: 'Search term' }),
        }),
    },
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
    body: subjectUpdateBodySchema,
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

export const deleteSelectedSubjectsSchema = {
    body: z.object({
        subject_ids: z.array(z.string().uuid('Invalid subject ID format')).min(1),
    }),
    response: z.object({
        message: z.string(),
        data: z.object({
            deleted_count: z.number().int().min(0),
        }),
    }),
};

export type DeleteSelectedSubjectsBody = z.infer<typeof deleteSelectedSubjectsSchema.body>;
export type DeleteSelectedSubjectsResponse = z.infer<typeof deleteSelectedSubjectsSchema.response>;
