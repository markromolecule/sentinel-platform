import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';

// Pull the shared base schema
const { sectionSchema: sectionBodySchema } = Schema;

// Section Response Schema Object (DB/API response shape)
export const sectionSchemaObject = {
    section_id: z.string().uuid(),
    section_name: z.string().openapi({ example: 'INF231' }),
    department_id: z
        .string()
        .uuid()
        .nullable()
        .openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    course_id: z
        .string()
        .uuid()
        .nullable()
        .openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    year_level: z.number().int().nullable().openapi({ example: 3 }),
    created_at: z
        .union([z.coerce.date(), z.string()])
        .nullable()
        .openapi({ example: new Date().toISOString() }),
    updated_at: z.union([z.coerce.date(), z.string()]).nullable().optional(),
    created_by: z.string().nullable().optional(),
    updated_by: z.string().nullable().optional(),
};

export const sectionSchemaOpenApi = z.object(sectionSchemaObject).openapi('Section');

export type SectionType = z.infer<typeof sectionSchemaOpenApi>;

// Create Section Operation
export const createSectionSchema = {
    body: sectionBodySchema,
    response: z.object({
        message: z.string(),
        data: sectionSchemaOpenApi,
    }),
};

export type CreateSectionBody = z.infer<typeof createSectionSchema.body>;
export type CreateSectionResponse = z.infer<typeof createSectionSchema.response>;

// Update Section Operation
export const updateSectionSchema = {
    params: z.object({
        id: z.string().uuid('Invalid section ID format'),
    }),
    body: sectionBodySchema.partial(),
    response: z.object({
        message: z.string(),
        data: sectionSchemaOpenApi,
    }),
};

export type UpdateSectionParams = z.infer<typeof updateSectionSchema.params>;
export type UpdateSectionBody = z.infer<typeof updateSectionSchema.body>;
export type UpdateSectionResponse = z.infer<typeof updateSectionSchema.response>;

// Get Sections Operation
export const getSectionsSchema = {
    request: {
        query: z.object({
            search: z.string().optional().openapi({ description: 'Search term' }),
        }),
    },
    response: z.object({
        message: z.string(),
        data: z.array(sectionSchemaOpenApi),
    }),
};

export type GetSectionsResponse = z.infer<typeof getSectionsSchema.response>;

// Delete Section Operation
export const deleteSectionSchema = {
    params: z.object({
        id: z.string().uuid('Invalid section ID format'),
    }),
    response: z.object({
        message: z.string(),
        data: z.null(),
    }),
};

export type DeleteSectionParams = z.infer<typeof deleteSectionSchema.params>;
export type DeleteSectionResponse = z.infer<typeof deleteSectionSchema.response>;
