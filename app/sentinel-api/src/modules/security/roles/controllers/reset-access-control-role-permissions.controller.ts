import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { resetRolePermissionsToBlueprintSchema } from '../roles.dto';
import { RolesService } from '../roles.service';
import { assertSupportAccess } from '../../access-control/services/access-control-authorization.service';

export const resetAccessControlRolePermissionsRoute = createRoute({
    method: 'post',
    path: '/roles/{roleId}/permissions/reset-blueprint',
    tags: ['Access Control'],
    summary: 'Reset system role-permission mappings to code blueprint',
    request: {
        params: resetRolePermissionsToBlueprintSchema.params,
    },
    responses: {
        200: {
            description: 'Role permissions reset to blueprint successfully.',
            content: {
                'application/json': {
                    schema: resetRolePermissionsToBlueprintSchema.response,
                },
            },
        },
    },
});

export const resetAccessControlRolePermissionsRouteHandler: AppRouteHandler<
    typeof resetAccessControlRolePermissionsRoute
> = async (c) => {
    const supabaseUser = c.get('supabaseUser') as any;
    assertSupportAccess(supabaseUser?.user_metadata?.role);

    const { roleId } = c.req.valid('param');
    const data = await RolesService.resetRolePermissionsToBlueprint(c.get('dbClient'), roleId);

    return c.json({ message: 'Access-control role permissions reset successfully.', data });
};
