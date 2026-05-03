import { z } from '@hono/zod-openapi';

export const inheritanceSchemaObject = {
    source_record_id: z.string().uuid().nullable().optional(),
    inheritance_status: z.string().nullable().optional(),
    origin_institution_id: z.string().uuid().nullable().optional(),
    effective_institution_id: z.string().uuid().nullable().optional(),
    is_local: z.boolean().optional(),
    is_inherited: z.boolean().optional(),
    is_overridden: z.boolean().optional(),
    is_hidden: z.boolean().optional(),
    // Camel case versions for frontend compatibility
    isLocal: z.boolean().optional(),
    isInherited: z.boolean().optional(),
    isOverridden: z.boolean().optional(),
    isHidden: z.boolean().optional(),
};
