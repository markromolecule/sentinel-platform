import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../types/hono';
import { getUsersSchema } from '../user.dto';
import { UserService } from '../user.service';

export const getUsersRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Users'],
    summary: 'Get all users',
    description: 'Retrieves all users.',
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

        // Prevent non-admins (e.g., student) from fetching users
        if (role !== 'admin' && role !== 'superadmin') {
            return c.json({ error: 'Forbidden. Insufficient permissions.' }, 403 as any);
        }

        // Regular admins MUST have an institution assigned
        if (role !== 'superadmin' && !institutionId) {
            return c.json(
                {
                    message: 'No institution assigned to this admin',
                    data: [],
                },
                200,
            );
        }

        const rawUsers = await UserService.getUsers(c.get('dbClient'), institutionId);

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
