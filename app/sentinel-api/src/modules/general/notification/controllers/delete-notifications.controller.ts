import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { requireActivePermission } from '../../../../lib/permissions';
import { type AppRouteHandler } from '../../../../types/hono';
import { NotificationService } from '../notification.service';
import { deleteNotificationsSchema } from '../notification.dto';

export const deleteNotificationsRoute = createRoute({
    method: 'delete',
    path: '/bulk',
    tags: ['Notifications'],
    summary: 'Delete selected notifications',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: deleteNotificationsSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Notifications deleted successfully',
            content: {
                'application/json': {
                    schema: deleteNotificationsSchema.response,
                },
            },
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        500: { description: 'Internal Server Error' },
    },
});

/**
 * Handle bulk notification deletion for the current authenticated user.
 */
export const deleteNotificationsRouteHandler: AppRouteHandler<
    typeof deleteNotificationsRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'notifications:view',
            'Forbidden. You do not have permission to delete notifications.',
        );

        const user = c.get('user');
        const { notificationIds } = c.req.valid('json');
        const count = await NotificationService.deleteNotifications({
            dbClient: c.get('dbClient'),
            recipientUserId: user.id,
            notificationIds,
        });

        return c.json({
            message: 'Notifications deleted successfully',
            count,
        });
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Delete notifications error:');
    }
};
