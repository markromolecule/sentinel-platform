import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { requireActivePermission } from '../../../../lib/permissions';
import { type AppRouteHandler } from '../../../../types/hono';
import { NotificationService } from '../notification.service';
import { markNotificationReadSchema } from '../notification.dto';

export const markNotificationReadRoute = createRoute({
    method: 'post',
    path: '/:id/read',
    tags: ['Notifications'],
    summary: 'Mark a notification as read',
    request: {
        params: markNotificationReadSchema.params,
    },
    responses: {
        200: {
            description: 'Notification marked as read successfully',
            content: {
                'application/json': {
                    schema: markNotificationReadSchema.response,
                },
            },
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Notification not found' },
        500: { description: 'Internal Server Error' },
    },
});

export const markNotificationReadRouteHandler: AppRouteHandler<
    typeof markNotificationReadRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'notifications:view',
            'Forbidden. You do not have permission to update notifications.',
        );

        const user = c.get('user');
        const { id } = c.req.valid('param');
        const notification = await NotificationService.markNotificationRead({
            dbClient: c.get('dbClient'),
            notificationId: id,
            recipientUserId: user.id,
        });

        return c.json({
            message: 'Notification marked as read successfully',
            data: notification,
        });
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Mark notification as read error:');
    }
};
