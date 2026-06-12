import { createRoute, z } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { requireActivePermission } from '../../../../lib/permissions';
import { type AppRouteHandler } from '../../../../types/hono';
import { NotificationService } from '../notification.service';

export const markAllNotificationsReadRoute = createRoute({
    method: 'post',
    path: '/read-all',
    tags: ['Notifications'],
    summary: 'Mark all notifications as read',
    responses: {
        200: {
            description: 'All notifications marked as read successfully',
            content: {
                'application/json': {
                    schema: z.object({
                        message: z.string(),
                        count: z.number(),
                    }),
                },
            },
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        500: { description: 'Internal Server Error' },
    },
});

export const markAllNotificationsReadRouteHandler: AppRouteHandler<
    typeof markAllNotificationsReadRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'notifications:view',
            'Forbidden. You do not have permission to update notifications.',
        );

        const user = c.get('user');
        const count = await NotificationService.markAllNotificationsRead({
            dbClient: c.get('dbClient'),
            recipientUserId: user.id,
        });

        return c.json({
            message: 'All notifications marked as read successfully',
            count,
        });
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Mark all notifications as read error:');
    }
};
