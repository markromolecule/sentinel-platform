import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';

const {
    institutionNamingConventionSchema: institutionNamingConventionBodySchema,
    institutionSchema: institutionBodySchema,
} = Schema;

const namingRulesSchema = z.object({
    room: z.object({
        label: z.string(),
        prefix: z.string(),
        virtualPrefix: z.string(),
    }),
    sectionRulesByCourseId: z.record(
        z.string(),
        z.object({
            courseId: z.string().uuid(),
            format: z.string(),
            preview: z.string(),
        }),
    ),
});

export const institutionNamingConventionSchemaObject = {
    id: z.string().uuid(),
    institutionId: z.string().uuid(),
    roomCodeFormat: z.string().nullable(),
    sectionCodeFormat: z.string().nullable(),
    namingRules: namingRulesSchema,
    sourceInstitutionId: z.string().uuid(),
    isInherited: z.boolean(),
};

export const institutionNamingConventionSchema = z.object(
    institutionNamingConventionSchemaObject,
);
export const institutionNamingConventionSchemaOpenApi =
    institutionNamingConventionSchema.openapi('InstitutionNamingConvention');

export const institutionSchemaObject = {
    id: z.uuid(),
    name: z.string(),
    code: z.string().nullable().openapi({
        example: 'NUD',
    }),
    parentInstitutionId: z.string().uuid().nullable().optional(),
    institutionKind: z.enum(['STANDALONE', 'PARENT', 'CHILD']).optional(),
    namingConventions: institutionNamingConventionSchema.nullable().optional(),
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
export type InstitutionNamingConventionType = z.infer<typeof institutionNamingConventionSchema>;

// Get Institutions Operation
export const getInstitutionsSchema = {
    request: {
        query: z.object({
            search: z.string().optional().openapi({ description: 'Search term' }),
            parentInstitutionId: z.string().uuid().optional(),
            institutionKind: z.enum(['STANDALONE', 'PARENT', 'CHILD']).optional(),
        }),
    },
    response: z.object({
        message: z.string(),
        data: z.array(institutionSchemaOpenApi),
    }),
};

// Create Institution Operation
export const createInstitutionSchema = {
    body: institutionBodySchema.extend({
        parentInstitutionId: z.string().uuid().nullable().optional(),
        institutionKind: z.enum(['STANDALONE', 'PARENT', 'CHILD']).optional(),
        namingConventions: institutionNamingConventionBodySchema.nullable().optional(),
    }),
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
    body: institutionBodySchema
        .extend({
            parentInstitutionId: z.string().uuid().nullable().optional(),
            institutionKind: z.enum(['STANDALONE', 'PARENT', 'CHILD']).optional(),
            namingConventions: institutionNamingConventionBodySchema.nullable().optional(),
        })
        .partial(),
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

// Bulk Delete Institutions Operation
export const deleteInstitutionsSchema = {
    body: z.object({
        ids: z.array(z.string().uuid()).min(1),
    }),
    response: z.object({
        message: z.string(),
        data: z.null(),
    }),
};

export const saveInstitutionNamingConventionSchema = {
    params: z.object({
        id: z.string().uuid('Invalid institution ID format'),
    }),
    body: institutionNamingConventionBodySchema,
    response: z.object({
        message: z.string(),
        data: institutionNamingConventionSchemaOpenApi,
    }),
};

export const getEffectiveInstitutionNamingConventionSchema = {
    params: z.object({
        id: z.string().uuid('Invalid institution ID format'),
    }),
    response: z.object({
        message: z.string(),
        data: institutionNamingConventionSchemaOpenApi.nullable(),
    }),
};

export const branchInstitutionSchema = institutionSchema;

export const getInstitutionBranchesSchema = {
    params: z.object({
        id: z.string().uuid('Invalid institution ID format'),
    }),
    response: z.object({
        message: z.string(),
        data: z.array(branchInstitutionSchema),
    }),
};

export const linkInstitutionBranchSchema = {
    params: z.object({
        id: z.string().uuid('Invalid institution ID format'),
    }),
    body: z.object({
        branchInstitutionId: z.string().uuid('Invalid branch institution ID format'),
    }),
    response: z.object({
        message: z.string(),
        data: branchInstitutionSchema,
    }),
};

export const unlinkInstitutionBranchSchema = {
    params: z.object({
        id: z.string().uuid('Invalid institution ID format'),
        branchId: z.string().uuid('Invalid branch institution ID format'),
    }),
    response: z.object({
        message: z.string(),
        data: institutionSchemaOpenApi,
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
export type SaveInstitutionNamingConventionParams = z.infer<
    typeof saveInstitutionNamingConventionSchema.params
>;
export type SaveInstitutionNamingConventionBody = z.infer<
    typeof saveInstitutionNamingConventionSchema.body
>;
export type SaveInstitutionNamingConventionResponse = z.infer<
    typeof saveInstitutionNamingConventionSchema.response
>;
export type GetEffectiveInstitutionNamingConventionParams = z.infer<
    typeof getEffectiveInstitutionNamingConventionSchema.params
>;

// Delete Institution Operation Types
export type DeleteInstitutionParams = z.infer<typeof deleteInstitutionSchema.params>;
export type DeleteInstitutionResponse = z.infer<typeof deleteInstitutionSchema.response>;

// Bulk Delete Institutions Operation Types
export type DeleteInstitutionsBody = z.infer<typeof deleteInstitutionsSchema.body>;
export type DeleteInstitutionsResponse = z.infer<typeof deleteInstitutionsSchema.response>;
export type GetInstitutionBranchesParams = z.infer<typeof getInstitutionBranchesSchema.params>;
export type LinkInstitutionBranchBody = z.infer<typeof linkInstitutionBranchSchema.body>;
export type UnlinkInstitutionBranchParams = z.infer<typeof unlinkInstitutionBranchSchema.params>;
