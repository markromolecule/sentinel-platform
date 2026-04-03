import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';

export const builderWorkspaceSchema = z
    .object(Schema.builderWorkspaceSchema.shape)
    .openapi('BuilderWorkspace');

export const getBuilderWorkspaceSchema = {
    params: Schema.builderWorkspaceParamsSchema,
    response: z.object({
        message: z.string(),
        data: builderWorkspaceSchema,
    }),
};

export const saveBuilderWorkspaceSchema = {
    params: Schema.builderWorkspaceParamsSchema,
    body: Schema.saveBuilderWorkspaceBodySchema,
    response: z.object({
        message: z.string(),
        data: builderWorkspaceSchema,
    }),
};

export const publishBuilderWorkspaceSchema = {
    params: Schema.builderWorkspaceParamsSchema,
    response: z.object({
        message: z.string(),
        data: builderWorkspaceSchema,
    }),
};

export type GetBuilderWorkspaceParams = z.infer<typeof getBuilderWorkspaceSchema.params>;
export type SaveBuilderWorkspaceParams = z.infer<typeof saveBuilderWorkspaceSchema.params>;
export type SaveBuilderWorkspaceBody = z.infer<typeof saveBuilderWorkspaceSchema.body>;
export type PublishBuilderWorkspaceParams = z.infer<typeof publishBuilderWorkspaceSchema.params>;
export type BuilderWorkspace = z.infer<typeof builderWorkspaceSchema>;
