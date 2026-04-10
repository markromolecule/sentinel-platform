import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { deleteUserSchema } from '../user.dto';
import { UserService } from '../user.service';
import { resolveRequesterRole } from '../../../../lib/resolve-requester-role';

export const deleteUserRoute = createRoute({
    method: 'delete',
    path: '/{id}',
    tags: ['Users'],
    summary: 'Delete a user',
    description: 'Deletes an existing user permanently.',
    request: {
        params: deleteUserSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: deleteUserSchema.response,
                },
            },
            description: 'User deleted successfully',
        },
        400: { description: 'Bad Request' },
        404: { description: 'User not found' },
        500: { description: 'Internal Server Error' },
    },
});

export const deleteUserRouteHandler: AppRouteHandler<typeof deleteUserRoute> = async (c) => {
    try {
        const params = c.req.valid('param');
        const supabaseUser = c.get('supabaseUser') as any;
        const user = c.get('user');
        const role = resolveRequesterRole(supabaseUser);
        const institutionId = c.get('institutionId');
        const scopedInstitutionId =
            role === 'support' || role === 'superadmin' ? undefined : institutionId;

        await UserService.deleteUser(
            c.get('dbClient'),
            params.id,
            role,
            scopedInstitutionId,
            user.id,
            user.user_profiles?.department_id ?? null,
            user.user_profiles?.course_id ?? null,
        );

        return c.json(
            {
                message: 'User deleted successfully',
                data: null,
            },
            200,
        );
    } catch (error: any) {
        console.error('Delete user error:', error);

        return c.json({ error: error?.message || 'Internal Server Error' }, error?.status || 500);
    }
};
