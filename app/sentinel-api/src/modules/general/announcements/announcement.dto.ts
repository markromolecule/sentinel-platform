import { z } from '@hono/zod-openapi';

export const announcementSchemaOpenApi = z
    .object({
        id: z.string().uuid(),
        title: z.string().max(255),
        slug: z.string().max(255),
        content: z.string(),
        published_at: z.union([z.coerce.date(), z.string()]).nullable(),
        unpublished_at: z.union([z.coerce.date(), z.string()]).nullable(),
        created_at: z.union([z.coerce.date(), z.string()]),
        updated_at: z.union([z.coerce.date(), z.string()]),
        deleted_at: z.union([z.coerce.date(), z.string()]).nullable(),
        author_id: z.string().uuid().nullable(),
        institution_id: z.string().uuid().nullable(),
        author_name: z.string().nullable().optional(),
    })
    .openapi('Announcement');

export const announcementQueryParamsSchema = z.object({
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
    search: z.string().optional(),
    sortBy: z.enum(['created_at', 'published_at', 'title']).default('created_at').optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
    status: z.enum(['draft', 'published', 'unpublished', 'all']).default('all').optional(),
});

export const getAnnouncementsSchema = {
    request: {
        query: announcementQueryParamsSchema,
    },
    response: z.object({
        success: z.boolean(),
        message: z.string(),
        data: z.array(announcementSchemaOpenApi),
        meta: z.object({
            total: z.number(),
            page: z.number(),
            limit: z.number(),
            totalPages: z.number(),
        }),
    }),
};

export const getAnnouncementByIdSchema = {
    params: z.object({
        id: z.string().uuid('Invalid announcement ID format'),
    }),
    response: z.object({
        success: z.boolean(),
        message: z.string(),
        data: announcementSchemaOpenApi,
    }),
};

export const getAnnouncementBySlugSchema = {
    params: z.object({
        slug: z.string().min(1, 'Slug is required'),
    }),
    response: z.object({
        success: z.boolean(),
        message: z.string(),
        data: announcementSchemaOpenApi,
    }),
};

export const createAnnouncementBodySchema = z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title must be at most 255 characters'),
    slug: z.string().max(255).optional(),
    content: z.string().min(1, 'Content is required'),
    published_at: z
        .string()
        .datetime({ message: 'published_at must be a valid ISO 8601 datetime' })
        .nullable()
        .optional(),
    unpublished_at: z
        .string()
        .datetime({ message: 'unpublished_at must be a valid ISO 8601 datetime' })
        .nullable()
        .optional(),
});

export const createAnnouncementSchema = {
    body: createAnnouncementBodySchema,
    response: z.object({
        success: z.boolean(),
        message: z.string(),
        data: announcementSchemaOpenApi,
    }),
};

export const updateAnnouncementBodySchema = createAnnouncementBodySchema.partial();

export const updateAnnouncementSchema = {
    params: z.object({
        id: z.string().uuid('Invalid announcement ID format'),
    }),
    body: updateAnnouncementBodySchema,
    response: z.object({
        success: z.boolean(),
        message: z.string(),
        data: announcementSchemaOpenApi,
    }),
};

export const deleteAnnouncementSchema = {
    params: z.object({
        id: z.string().uuid('Invalid announcement ID format'),
    }),
    response: z.object({
        success: z.boolean(),
        message: z.string(),
        data: z.null(),
    }),
};

export type CreateAnnouncementDto = z.infer<typeof createAnnouncementBodySchema>;
export type UpdateAnnouncementDto = z.infer<typeof updateAnnouncementBodySchema>;
export type AnnouncementQueryParams = z.infer<typeof announcementQueryParamsSchema>;
export type AnnouncementRow = z.infer<typeof announcementSchemaOpenApi>;
