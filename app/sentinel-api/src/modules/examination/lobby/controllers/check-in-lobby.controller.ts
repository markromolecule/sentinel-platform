import { createRoute } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { type AppRouteHandler } from '../../../../types/hono';
import { checkInLobbySchema } from '../lobby.dto';
import { LobbyService } from '../lobby.service';

export const checkInLobbyRoute = createRoute({
    method: 'post',
    path: '/:id/lobby/check-in',
    tags: ['Lobby'],
    summary: 'Student checks into the exam lobby',
    request: {
        params: checkInLobbySchema.params,
    },
    responses: {
        200: {
            description: 'Checked in successfully',
            content: {
                'application/json': {
                    schema: checkInLobbySchema.response,
                },
            },
        },
    },
});

export const checkInLobbyRouteHandler: AppRouteHandler<typeof checkInLobbyRoute> = async (c) => {
    const { id } = c.req.valid('param');
    const user = c.get('user');

    if (!user) {
        throw new HTTPException(401, { message: 'Not logged in' });
    }

    const result = await LobbyService.checkIn(c.get('dbClient'), id, user.id);

    return c.json({
        message: 'Checked in successfully',
        data: result,
    });
};
