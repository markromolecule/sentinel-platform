import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { updateRoomSchema } from '../room.dto';
import { updateRoomService } from '../services/update-room.service';

export const updateRoomRoute = createRoute({
    method: 'put',
    path: '/{id}',
    tags: ['Rooms'],
    summary: 'Update a room',
    description: 'Updates an existing room.',
    request: {
        params: updateRoomSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: updateRoomSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: updateRoomSchema.response,
                },
            },
            description: 'Room updated successfully',
        },
        400: { description: 'Bad Request' },
        404: { description: 'Not Found' },
        409: { description: 'Conflict' },
        500: { description: 'Internal Server Error' },
    },
});

export const updateRoomRouteHandler: AppRouteHandler<typeof updateRoomRoute> = async (c) => {
    try {
        requireActivePermission(c, 'rooms:update', 'Forbidden. Missing rooms:update permission.');
        const id = c.req.valid('param').id;
        const body = c.req.valid('json');
        const user = c.get('user');
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const institutionId = c.get('institutionId');

        // Support role can manage any institution, ignoring their own profile institution
        const enforcedId = role === 'support' ? undefined : institutionId;

        const room = await updateRoomService({
            dbClient: c.get('dbClient'),
            id,
            data: body,
            updatedBy: user.id,
            institutionId: enforcedId,
        });

        return c.json(
            {
                message: 'Room updated successfully',
                data: room,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Update room error:');
    }
};
