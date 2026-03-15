import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';

const { institutionSchema: institutionBodySchema } = Schema;

export const institutionSchemaObject = {
    id: z.uuid(),
    name: z.string(),
    code: z.string().nullable().openapi({
        example: 'NUD',
    }),
    createdAt: z.union([z.coerce.date(), z.string()]).nullable().openapi({
        example: new Date().toISOString(),
    }),
    createdBy: z.string().nullable(),
    updatedAt: z.union([z.coerce.date(), z.string()]).nullable().openapi({
        example: new Date().toISOString(),
    }),
    updatedBy: z.string().nullable(),
};

export const institutionSchema = z.object(institutionSchemaObject);
export const institutionSchemaOpenApi = institutionSchema.openapi('Institution');

export type InstitutionType = z.infer<typeof institutionSchema>;

// Get Institutions Operation
export const getInstitutionsSchema = {
    body: institutionBodySchema,
    response: z.object({
        message: z.string(),
        data: z.array(institutionSchemaOpenApi),
    }),
};

// Create Institution Operation
export const createInstitutionSchema = {
    body: institutionBodySchema,
    response: z.object({
        message: z.string(),
        data: institutionSchemaOpenApi,
    }),
};

// Update Institution Operation
export const updateInstitutionSchema = {
    params: z.object({
        id: z.string().uuid('Invalid institution ID format'),
    }),
    body: institutionBodySchema.partial(),
    response: z.object({
        message: z.string(),
        data: institutionSchemaOpenApi,
    }),
};

// Delete Institution Operation
export const deleteInstitutionSchema = {
    params: z.object({
        id: z.string().uuid('Invalid institution ID format'),
    }),
    response: z.object({
        message: z.string(),
        data: z.null(),
    }),
};

// Type Exports
export type GetInstitutionsResponse = z.infer<typeof getInstitutionsSchema.response>;

// Create Institution Operation Types
export type CreateInstitutionBody = z.infer<typeof createInstitutionSchema.body>;
export type CreateInstitutionResponse = z.infer<typeof createInstitutionSchema.response>;

// Update Institution Operation Types
export type UpdateInstitutionParams = z.infer<typeof updateInstitutionSchema.params>;
export type UpdateInstitutionBody = z.infer<typeof updateInstitutionSchema.body>;
export type UpdateInstitutionResponse = z.infer<typeof updateInstitutionSchema.response>;

// Delete Institution Operation Types
export type DeleteInstitutionParams = z.infer<typeof deleteInstitutionSchema.params>;
export type DeleteInstitutionResponse = z.infer<typeof deleteInstitutionSchema.response>;
