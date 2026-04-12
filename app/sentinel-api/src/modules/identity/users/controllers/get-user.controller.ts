import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { getUserActivePermissions } from '../../../security/permission/data/get-user-active-permissions';
import { getUserSchema } from '../user.dto';
import { UserService } from '../user.service';

export const getUserRoute = createRoute({
    method: 'get',
    path: '/{id}',
    tags: ['Users'],
    summary: 'Get a single user',
    description: 'Retrieves a single user by ID.',
    request: {
        params: getUserSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getUserSchema.response,
                },
            },
            description: 'User fetched successfully',
        },
        404: { description: 'User not found' },
        500: { description: 'Internal Server Error' },
    },
});

export const getUserRouteHandler: AppRouteHandler<typeof getUserRoute> = async (c) => {
    try {
        const params = c.req.valid('param');
        const institutionId = c.get('institutionId');
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const user = c.get('user');
        const scopedInstitutionId =
            role === 'support' || role === 'superadmin' ? undefined : institutionId;

        const rawUser = await UserService.getUserById(
            c.get('dbClient'),
            params.id,
            scopedInstitutionId,
            role,
            user.user_profiles?.department_id ?? null,
            user.user_profiles?.course_id ?? null,
        );
        const activePermissionKeys = await getUserActivePermissions(c.get('dbClient'), params.id);

        return c.json(
            {
                message: 'User fetched successfully',
                data: {
                    ...rawUser,
                    active_permission_keys: activePermissionKeys,
                },
            },
            200,
        );
    } catch (error: any) {
        console.error('Fetch user error:', error);
        if (error?.status === 404 || error?.message === 'User not found') {
            return c.json({ error: 'User not found' }, 404);
        }
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
