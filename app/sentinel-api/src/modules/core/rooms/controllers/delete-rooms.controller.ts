import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { deleteRoomsSchema } from '../room.dto';
import { RoomService } from '../room.service';

export const deleteRoomsRoute = createRoute({
    method: 'post',
    path: '/bulk-delete',
    tags: ['Rooms', 'Support'],
    summary: 'Bulk delete rooms',
    description: 'Deletes multiple rooms at once.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: deleteRoomsSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: deleteRoomsSchema.response,
                },
            },
            description: 'Rooms deleted successfully',
        },
        400: { description: 'Bad Request' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Not Found' },
        409: { description: 'Conflict (Rooms in use)' },
        500: { description: 'Internal Server Error' },
    },
});

export const deleteRoomsRouteHandler: AppRouteHandler<typeof deleteRoomsRoute> = async (c) => {
    try {
        requireActivePermission(c, 'rooms:delete', 'Forbidden. Missing rooms:delete permission.');

        const { ids } = c.req.valid('json');
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const institutionId = c.get('institutionId');
        const user = c.get('user');

        const enforcedId = role === 'support' ? undefined : (institutionId as string | undefined);

        await RoomService.deleteRooms(c.get('dbClient'), ids, enforcedId, user.id);

        return c.json(
            {
                message: 'Rooms deleted successfully',
                data: null,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Bulk delete rooms error:');
    }
};
