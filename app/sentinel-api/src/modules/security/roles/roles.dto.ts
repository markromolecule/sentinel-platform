import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';

const {
    accessControlRoleBodySchema,
    accessControlRoleParamsSchema,
    accessControlRolePermissionsBodySchema,
    accessControlRoleSchema: accessControlRoleRecordSchema,
    accessControlRoleUpdateBodySchema,
} = Schema;

export const accessControlRoleSchemaObject = {
    ...accessControlRoleRecordSchema.shape,
};

export const accessControlRoleSchema = z
    .object(accessControlRoleSchemaObject)
    .openapi('AccessControlRole');

export const getRolesSchema = {
    query: z.object({
        search: z.string().optional(),
    }),
    response: z.object({
        message: z.string(),
        data: z.array(accessControlRoleSchema),
    }),
};

export const createRoleSchema = {
    body: accessControlRoleBodySchema,
    response: z.object({
        message: z.string(),
        data: accessControlRoleSchema,
    }),
};

export const updateRoleSchema = {
    params: accessControlRoleParamsSchema,
    body: accessControlRoleUpdateBodySchema,
    response: z.object({
        message: z.string(),
        data: accessControlRoleSchema,
    }),
};

export const deleteRoleSchema = {
    params: accessControlRoleParamsSchema,
    response: z.object({
        message: z.string(),
        data: z.null(),
    }),
};

export const replaceRolePermissionsSchema = {
    params: accessControlRoleParamsSchema,
    body: accessControlRolePermissionsBodySchema,
    response: z.object({
        message: z.string(),
        data: accessControlRoleSchema,
    }),
};

export type GetRolesResponse = z.infer<typeof getRolesSchema.response>;
export type CreateRoleBody = z.infer<typeof createRoleSchema.body>;
export type CreateRoleResponse = z.infer<typeof createRoleSchema.response>;
export type UpdateRoleParams = z.infer<typeof updateRoleSchema.params>;
export type UpdateRoleBody = z.infer<typeof updateRoleSchema.body>;
export type UpdateRoleResponse = z.infer<typeof updateRoleSchema.response>;
export type DeleteRoleParams = z.infer<typeof deleteRoleSchema.params>;
export type DeleteRoleResponse = z.infer<typeof deleteRoleSchema.response>;
export type ReplaceRolePermissionsParams = z.infer<typeof replaceRolePermissionsSchema.params>;
export type ReplaceRolePermissionsBody = z.infer<typeof replaceRolePermissionsSchema.body>;
export type ReplaceRolePermissionsResponse = z.infer<typeof replaceRolePermissionsSchema.response>;

export const resetRolePermissionsToBlueprintSchema = {
    params: accessControlRoleParamsSchema,
    response: z.object({
        message: z.string(),
        data: accessControlRoleSchema,
    }),
};

export type ResetRolePermissionsToBlueprintParams = z.infer<
    typeof resetRolePermissionsToBlueprintSchema.params
>;
export type ResetRolePermissionsToBlueprintResponse = z.infer<
    typeof resetRolePermissionsToBlueprintSchema.response
>;
