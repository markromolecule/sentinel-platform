import { createRoute } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { requireActivePermission } from '../../../../lib/permissions';
import { type AppRouteHandler } from '../../../../types/hono';
import { bulkCreateRoomsSchema } from '../room.dto';
import { RoomService } from '../room.service';

export const bulkCreateRoomsRoute = createRoute({
    method: 'post',
    path: '/bulk',
    tags: ['Rooms'],
    summary: 'Bulk create rooms',
    description: 'Creates multiple rooms at once.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: bulkCreateRoomsSchema.body,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                'application/json': {
                    schema: bulkCreateRoomsSchema.response,
                },
            },
            description: 'Rooms created successfully',
        },
        400: { description: 'Bad Request' },
        409: { description: 'Conflict' },
        500: { description: 'Internal Server Error' },
    },
});

export const bulkCreateRoomsRouteHandler: AppRouteHandler<typeof bulkCreateRoomsRoute> = async (
    c,
) => {
    try {
        requireActivePermission(c, 'rooms:create', 'Forbidden. Missing rooms:create permission.');
        const body = c.req.valid('json');
        const user = c.get('user');
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const institutionId = c.get('institutionId');

        // Support role can manage any institution, ignoring their own profile institution
        const enforcedInstitutionId = role === 'support' ? undefined : institutionId;

        const rooms = await RoomService.bulkCreateRooms(
            c.get('dbClient'),
            body,
            user.id,
            enforcedInstitutionId,
        );

        return c.json(
            {
                message: 'Rooms created successfully',
                data: rooms,
            },
            201,
        );
    } catch (error: any) {
        if (error instanceof HTTPException) {
            if (error.status >= 500) {
                console.error('Bulk create rooms error:', error);
            }

            return c.json(
                {
                    message: error.message || 'Request failed',
                },
                error.status,
            );
        }

        console.error('Bulk create rooms error:', error);
        return c.json(
            {
                message: error?.message || 'Internal Server Error',
            },
            error?.status || 500,
        );
    }
};
