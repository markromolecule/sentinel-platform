import { z } from '@hono/zod-openapi';

export const uploadPassageImageMultipartSchema = z.object({
    file: z.any().openapi({
        type: 'string',
        format: 'binary',
    }),
});

export const uploadPassageImageResponseSchema = z.object({
    message: z.string(),
    data: z.object({
        url: z.string().url(),
        path: z.string(),
        bucket: z.string(),
    }),
});
