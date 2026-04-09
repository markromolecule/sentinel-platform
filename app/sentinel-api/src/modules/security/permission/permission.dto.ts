import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';

const {
    accessControlPermissionBodySchema,
    accessControlPermissionParamsSchema,
    accessControlPermissionSchema: accessControlPermissionRecordSchema,
    accessControlPermissionUpdateBodySchema,
} = Schema;

export const accessControlPermissionSchemaObject = {
    ...accessControlPermissionRecordSchema.shape,
};

export const accessControlPermissionSchema = z
    .object(accessControlPermissionSchemaObject)
    .openapi('AccessControlPermission');

export const getPermissionsSchema = {
    response: z.object({
        message: z.string(),
        data: z.array(accessControlPermissionSchema),
    }),
};

export const createPermissionSchema = {
    body: accessControlPermissionBodySchema,
    response: z.object({
        message: z.string(),
        data: accessControlPermissionSchema,
    }),
};

export const updatePermissionSchema = {
    params: accessControlPermissionParamsSchema,
    body: accessControlPermissionUpdateBodySchema,
    response: z.object({
        message: z.string(),
        data: accessControlPermissionSchema,
    }),
};

export const deletePermissionSchema = {
    params: accessControlPermissionParamsSchema,
    response: z.object({
        message: z.string(),
        data: z.null(),
    }),
};

export type GetPermissionsResponse = z.infer<typeof getPermissionsSchema.response>;
export type CreatePermissionBody = z.infer<typeof createPermissionSchema.body>;
export type CreatePermissionResponse = z.infer<typeof createPermissionSchema.response>;
export type UpdatePermissionParams = z.infer<typeof updatePermissionSchema.params>;
export type UpdatePermissionBody = z.infer<typeof updatePermissionSchema.body>;
export type UpdatePermissionResponse = z.infer<typeof updatePermissionSchema.response>;
export type DeletePermissionParams = z.infer<typeof deletePermissionSchema.params>;
export type DeletePermissionResponse = z.infer<typeof deletePermissionSchema.response>;
