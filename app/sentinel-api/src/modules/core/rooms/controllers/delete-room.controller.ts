import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { deleteRoomSchema } from '../room.dto';
import { RoomService } from '../room.service';

export const deleteRoomRoute = createRoute({
    method: 'delete',
    path: '/{id}',
    tags: ['Rooms'],
    summary: 'Delete a room',
    description: 'Deletes an existing room.',
    request: {
        params: deleteRoomSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: deleteRoomSchema.response,
                },
            },
            description: 'Room deleted successfully',
        },
        400: { description: 'Bad Request' },
        404: { description: 'Not Found' },
        409: { description: 'Conflict (Room in use)' },
        500: { description: 'Internal Server Error' },
    },
});

export const deleteRoomRouteHandler: AppRouteHandler<typeof deleteRoomRoute> = async (c) => {
    try {
        requireActivePermission(c, 'rooms:delete', 'Forbidden. Missing rooms:delete permission.');
        const id = c.req.valid('param').id;
        const user = c.get('user');
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const institutionId = c.get('institutionId');

        // Support role can manage any institution, ignoring their own profile institution
        const enforcedId = role === 'support' ? undefined : institutionId;

        await RoomService.deleteRoom(c.get('dbClient'), id, user.id, enforcedId);

        return c.json(
            {
                message: 'Room deleted successfully',
                data: null,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Delete room error:');
    }
};
