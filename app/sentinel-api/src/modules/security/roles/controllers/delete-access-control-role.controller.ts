import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { deleteRoleSchema } from '../roles.dto';
import { RolesService } from '../roles.service';
import { assertSupportAccess } from '../../access-control/services/access-control-authorization.service';

export const deleteAccessControlRoleRoute = createRoute({
    method: 'delete',
    path: '/roles/{roleId}',
    tags: ['Access Control'],
    summary: 'Delete access-control role',
    request: {
        params: deleteRoleSchema.params,
    },
    responses: {
        200: {
            description: 'Role deleted successfully.',
            content: {
                'application/json': {
                    schema: deleteRoleSchema.response,
                },
            },
        },
    },
});

export const deleteAccessControlRoleRouteHandler: AppRouteHandler<
    typeof deleteAccessControlRoleRoute
> = async (c) => {
    const supabaseUser = c.get('supabaseUser') as any;
    assertSupportAccess(supabaseUser?.user_metadata?.role);
    const user = c.get('user');
    const institutionId = c.get('institutionId');

    const { roleId } = c.req.valid('param');
    await RolesService.deleteRole(c.get('dbClient'), roleId, user?.id, institutionId);

    return c.json({ message: 'Access-control role deleted successfully.', data: null });
};
