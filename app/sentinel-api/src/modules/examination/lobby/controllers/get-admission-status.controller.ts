import { createRoute } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { type AppRouteHandler } from '../../../../types/hono';
import { getAdmissionStatusSchema } from '../lobby.dto';
import { LobbyService } from '../lobby.service';

export const getAdmissionStatusRoute = createRoute({
    method: 'get',
    path: '/:id/lobby/admission-status',
    tags: ['Lobby'],
    summary: 'Student polls for their admission status',
    request: {
        params: getAdmissionStatusSchema.params,
    },
    responses: {
        200: {
            description: 'Admission status retrieved',
            content: {
                'application/json': {
                    schema: getAdmissionStatusSchema.response,
                },
            },
        },
    },
});

export const getAdmissionStatusRouteHandler: AppRouteHandler<
    typeof getAdmissionStatusRoute
> = async (c) => {
    const { id } = c.req.valid('param');
    const user = c.get('user');

    if (!user) {
        throw new HTTPException(401, { message: 'Not logged in' });
    }

    const result = await LobbyService.getAdmissionStatus(c.get('dbClient'), id, user.id);

    return c.json({
        message: 'Admission status retrieved',
        data: result,
    });
};
