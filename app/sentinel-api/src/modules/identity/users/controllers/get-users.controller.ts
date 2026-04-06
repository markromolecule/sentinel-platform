import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '@/types/hono';
import { getUsersSchema } from '../user.dto';
import { UserService } from '../user.service';

export const getUsersRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Users'],
    summary: 'Get all users',
    description: 'Retrieves all users.',
    request: getUsersSchema.request,
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getUsersSchema.response,
                },
            },
            description: 'Users fetched successfully',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const getUsersRouteHandler: AppRouteHandler<typeof getUsersRoute> = async (c) => {
    try {
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const institutionId = c.get('institutionId');

        if (role !== 'admin' && role !== 'superadmin' && role !== 'support') {
            return c.json({ error: 'Forbidden. Insufficient permissions.' }, 403 as any);
        }

        if (role === 'admin' && !institutionId) {
            return c.json(
                {
                    message: 'No institution assigned to this admin',
                    data: [],
                },
                200,
            );
        }

        const { search } = c.req.valid('query');
        const rawUsers = await UserService.getUsers(c.get('dbClient'), institutionId, search, role);

        return c.json(
            {
                message: 'Users fetched successfully',
                data: rawUsers,
            },
            200,
        );
    } catch (error: any) {
        console.error('Fetch users error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
