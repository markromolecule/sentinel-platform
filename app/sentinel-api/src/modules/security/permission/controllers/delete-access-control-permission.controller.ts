import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { deletePermissionSchema } from '../permission.dto';
import { PermissionService } from '../services/permission.service';
import { assertSupportAccess } from '../../access-control/services/access-control-authorization.service';

export const deleteAccessControlPermissionRoute = createRoute({
    method: 'delete',
    path: '/permissions/{permissionId}',
    tags: ['Access Control'],
    summary: 'Delete access-control permission',
    request: {
        params: deletePermissionSchema.params,
    },
    responses: {
        200: {
            description: 'Permission deleted successfully.',
            content: {
                'application/json': {
                    schema: deletePermissionSchema.response,
                },
            },
        },
    },
});

export const deleteAccessControlPermissionRouteHandler: AppRouteHandler<
    typeof deleteAccessControlPermissionRoute
> = async (c) => {
    const supabaseUser = c.get('supabaseUser') as any;
    assertSupportAccess(supabaseUser?.user_metadata?.role);

    const { permissionId } = c.req.valid('param');
    await PermissionService.deletePermission(c.get('dbClient'), permissionId);

    return c.json({ message: 'Access-control permission deleted successfully.', data: null });
};
