import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { updateRoleSchema } from '../roles.dto';
import { RolesService } from '../services/roles.service';
import { assertSupportAccess } from '../../access-control/services/access-control-authorization.service';

export const updateAccessControlRoleRoute = createRoute({
    method: 'patch',
    path: '/roles/{roleId}',
    tags: ['Access Control'],
    summary: 'Update access-control role',
    request: {
        params: updateRoleSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: updateRoleSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Role updated successfully.',
            content: {
                'application/json': {
                    schema: updateRoleSchema.response,
                },
            },
        },
    },
});

export const updateAccessControlRoleRouteHandler: AppRouteHandler<
    typeof updateAccessControlRoleRoute
> = async (c) => {
    const supabaseUser = c.get('supabaseUser') as any;
    assertSupportAccess(supabaseUser?.user_metadata?.role);
    const user = c.get('user');
    const institutionId = c.get('institutionId');

    const { roleId } = c.req.valid('param');
    const body = c.req.valid('json');
    const data = await RolesService.updateRole(
        c.get('dbClient'),
        roleId,
        body,
        user?.id,
        institutionId,
    );

    return c.json({ message: 'Access-control role updated successfully.', data });
};
