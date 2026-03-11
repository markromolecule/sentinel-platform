import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../types/hono';
import { updateUserSchema } from '../user.dto';
import { UserService } from '../user.service';

export const updateUserRoute = createRoute({
    method: 'patch',
    path: '/{id}',
    tags: ['Users'],
    summary: 'Update a user',
    description: 'Updates an existing user.',
    request: {
        params: updateUserSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: updateUserSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: updateUserSchema.response,
                },
            },
            description: 'User updated successfully',
        },
        400: { description: 'Bad Request' },
        404: { description: 'User not found' },
        500: { description: 'Internal Server Error' },
    },
});

export const updateUserRouteHandler: AppRouteHandler<typeof updateUserRoute> = async (c) => {
    try {
        const params = c.req.valid('param');
        const body = c.req.valid('json');

        const user = await UserService.updateUser(c.get('dbClient'), params.id, body);

        return c.json(
            {
                message: 'User updated successfully',
                data: user,
            },
            200,
        );
    } catch (error: any) {
        console.error('Update user error:', error);

        if (error?.status === 404 || error?.message === 'User profile not found after update') {
            return c.json({ error: 'User not found' }, 404);
        }

        return c.json({ error: error?.message || 'Internal Server Error' }, error?.status || 500);
    }
};
