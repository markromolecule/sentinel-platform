import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { syncSessionSchema } from '../flow.dto';
import { SessionManagerService } from '../flow.service';

export const syncSessionRoute = createRoute({
    method: 'post',
    path: '/sync',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: syncSessionSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: syncSessionSchema.response,
                },
            },
            description: 'Sync session progress',
        },
    },
    tags: ['Examination Flow'],
});

export const syncSessionRouteHandler: AppRouteHandler<typeof syncSessionRoute> = async (c) => {
    const body = await c.req.json();
    const user = c.get('user');

    await SessionManagerService.syncSession(c.get('dbClient'), user.id, body);

    return c.json({
        message: 'Session progress synced successfully.',
    });
};
