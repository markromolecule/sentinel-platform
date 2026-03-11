import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../types/hono';
import { createUserSchema } from '../user.dto';
import { UserService } from '../user.service';

export const createUserRoute = createRoute({
    method: 'post',
    path: '/',
    tags: ['Users'],
    summary: 'Create a user',
    description: 'Creates a new user.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createUserSchema.body,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                'application/json': {
                    schema: createUserSchema.response,
                },
            },
            description: 'User created successfully',
        },
        400: { description: 'Bad Request' },
        409: { description: 'User already exists' },
        500: { description: 'Internal Server Error' },
    },
});

export const createUserRouteHandler: AppRouteHandler<typeof createUserRoute> = async (c) => {
    try {
        const body = c.req.valid('json');
        const user = await UserService.createUser(c.get('dbClient'), body);

        return c.json(
            {
                message: 'User created successfully',
                data: user,
            },
            201,
        );
    } catch (error: any) {
        console.error('Create user error:', error);
        return c.json({ error: error?.message || 'Internal Server Error' }, error?.status || 500);
    }
};
