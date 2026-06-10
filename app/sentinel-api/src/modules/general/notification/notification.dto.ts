import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';

export const notificationSchemaOpenApi = z
    .object(Schema.notificationSchema.shape)
    .openapi('Notification');

export const notificationListSchemaOpenApi = z
    .object(Schema.notificationListSchema.shape)
    .openapi('NotificationList');

export const getNotificationsSchema = {
    request: {
        query: z.object({
            status: Schema.notificationStatusSchema.optional().openapi({
                description: 'Filter notifications by read state.',
            }),
            limit: z.coerce.number().int().min(1).max(100).optional().openapi({
                description: 'Maximum number of notifications to return.',
                example: 20,
            }),
        }),
    },
    response: z.object({
        message: z.string(),
        data: notificationListSchemaOpenApi,
    }),
};

export const markNotificationReadSchema = {
    params: z.object({
        id: z.string().uuid('Invalid notification ID format'),
    }),
    response: z.object({
        message: z.string(),
        data: notificationSchemaOpenApi,
    }),
};

export const deleteNotificationsSchema = {
    body: z.object({
        notificationIds: z
            .array(z.string().uuid('Invalid notification ID format'))
            .min(1, 'At least one notification ID is required'),
    }),
    response: z.object({
        message: z.string(),
        count: z.number().int().min(0),
    }),
};

export type GetNotificationsQuery = z.infer<typeof getNotificationsSchema.request.query>;
