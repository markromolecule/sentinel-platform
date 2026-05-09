import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { requireActivePermission } from '../../../../lib/permissions';
import { type AppRouteHandler } from '../../../../types/hono';
import { NotificationService } from '../notification.service';
import { getNotificationsSchema } from '../notification.dto';

export const getNotificationsRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Notifications'],
    summary: 'List notifications for the current user',
    request: getNotificationsSchema.request,
    responses: {
        200: {
            description: 'Notifications fetched successfully',
            content: {
                'application/json': {
                    schema: getNotificationsSchema.response,
                },
            },
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        500: { description: 'Internal Server Error' },
    },
});

export const getNotificationsRouteHandler: AppRouteHandler<typeof getNotificationsRoute> = async (
    c,
) => {
    try {
        requireActivePermission(
            c,
            'notifications:view',
            'Forbidden. You do not have permission to view notifications.',
        );

        const user = c.get('user');
        const query = c.req.valid('query');
        const notifications = await NotificationService.listNotifications({
            dbClient: c.get('dbClient'),
            recipientUserId: user.id,
            institutionId: c.get('institutionId'),
            status: query.status,
            limit: query.limit,
        });

        return c.json({
            message: 'Notifications fetched successfully',
            data: notifications,
        });
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Get notifications error:');
    }
};
