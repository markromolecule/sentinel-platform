import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { getLobbyCountSchema } from '../lobby.dto';
import { LobbyService } from '../lobby.service';

export const getLobbyCountRoute = createRoute({
    method: 'get',
    path: '/:id/lobby/count',
    tags: ['Lobby'],
    summary: 'Gets the current exam lobby count',
    request: {
        params: getLobbyCountSchema.params,
    },
    responses: {
        200: {
            description: 'Lobby count retrieved successfully',
            content: {
                'application/json': {
                    schema: getLobbyCountSchema.response,
                },
            },
        },
    },
});

export const getLobbyCountRouteHandler: AppRouteHandler<typeof getLobbyCountRoute> = async (c) => {
    const { id } = c.req.valid('param');
    const result = await LobbyService.getLobbyCount(c.get('dbClient'), id);

    return c.json({
        message: 'Lobby count retrieved successfully',
        data: result,
    });
};
