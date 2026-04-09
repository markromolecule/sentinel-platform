import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { getPermissionsSchema } from '../permission.dto';
import { PermissionService } from '../services/permission.service';
import { assertSupportAccess } from '../../access-control/services/access-control-authorization.service';

export const getAccessControlPermissionsRoute = createRoute({
    method: 'get',
    path: '/permissions',
    tags: ['Access Control'],
    summary: 'Get access-control permissions',
    responses: {
        200: {
            description: 'Permissions fetched successfully.',
            content: {
                'application/json': {
                    schema: getPermissionsSchema.response,
                },
            },
        },
    },
});

export const getAccessControlPermissionsRouteHandler: AppRouteHandler<
    typeof getAccessControlPermissionsRoute
> = async (c) => {
    const supabaseUser = c.get('supabaseUser') as any;
    assertSupportAccess(supabaseUser?.user_metadata?.role);

    const data = await PermissionService.getPermissions(c.get('dbClient'));

    return c.json({ message: 'Access-control permissions fetched successfully.', data });
};
