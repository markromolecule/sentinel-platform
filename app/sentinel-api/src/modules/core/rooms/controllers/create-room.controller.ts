import { createRoute } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { requireActivePermission } from '../../../../lib/permissions';
import { type AppRouteHandler } from '../../../../types/hono';
import { createRoomSchema } from '../room.dto';
import { createRoomService } from '../services/create-room.service';

export const createRoomRoute = createRoute({
    method: 'post',
    path: '/',
    tags: ['Rooms'],
    summary: 'Create a room',
    description: 'Creates a new room.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createRoomSchema.body,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                'application/json': {
                    schema: createRoomSchema.response,
                },
            },
            description: 'Room created successfully',
        },
        400: { description: 'Bad Request' },
        409: { description: 'Conflict' },
        500: { description: 'Internal Server Error' },
    },
});

export const createRoomRouteHandler: AppRouteHandler<typeof createRoomRoute> = async (c) => {
    try {
        requireActivePermission(c, 'rooms:create', 'Forbidden. Missing rooms:create permission.');
        const body = c.req.valid('json');
        const user = c.get('user');
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const institutionId = c.get('institutionId');

        // Support role can manage any institution, ignoring their own profile institution
        const enforcedInstitutionId = role === 'support' ? undefined : institutionId;

        const room = await createRoomService({
            dbClient: c.get('dbClient'),
            data: body,
            createdBy: user.id,
            institutionId: enforcedInstitutionId,
        });

        return c.json(
            {
                message: 'Room created successfully',
                data: room,
            },
            201,
        );
    } catch (error: any) {
        if (error instanceof HTTPException) {
            if (error.status >= 500) {
                console.error('Create room error:', error);
            }

            return c.json(
                {
                    message: error.message || 'Request failed',
                },
                error.status,
            );
        }

        console.error('Create room error:', error);
        return c.json(
            {
                message: error?.message || 'Internal Server Error',
            },
            error?.status || 500,
        );
    }
};
