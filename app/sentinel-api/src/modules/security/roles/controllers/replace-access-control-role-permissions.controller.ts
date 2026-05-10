import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { replaceRolePermissionsSchema } from '../roles.dto';
import { RolesService } from '../services/roles.service';
import { assertSupportAccess } from '../../access-control/services/access-control-authorization.service';

export const replaceAccessControlRolePermissionsRoute = createRoute({
    method: 'put',
    path: '/roles/{roleId}/permissions',
    tags: ['Access Control'],
    summary: 'Replace role-permission mappings',
    request: {
        params: replaceRolePermissionsSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: replaceRolePermissionsSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Role permissions replaced successfully.',
            content: {
                'application/json': {
                    schema: replaceRolePermissionsSchema.response,
                },
            },
        },
    },
});

export const replaceAccessControlRolePermissionsRouteHandler: AppRouteHandler<
    typeof replaceAccessControlRolePermissionsRoute
> = async (c) => {
    const supabaseUser = c.get('supabaseUser') as any;
    assertSupportAccess(supabaseUser?.user_metadata?.role);
    const user = c.get('user');
    const institutionId = c.get('institutionId');

    const { roleId } = c.req.valid('param');
    const { permissionIds } = c.req.valid('json');
    const data = await RolesService.replaceRolePermissions(
        c.get('dbClient'),
        roleId,
        permissionIds,
        user?.id,
        institutionId,
    );

    return c.json({ message: 'Access-control role permissions updated successfully.', data });
};
