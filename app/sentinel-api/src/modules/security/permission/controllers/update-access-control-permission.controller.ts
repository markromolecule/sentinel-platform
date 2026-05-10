import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { updatePermissionSchema } from '../permission.dto';
import { PermissionService } from '../services/permission.service';
import { assertSupportAccess } from '../../access-control/services/access-control-authorization.service';

export const updateAccessControlPermissionRoute = createRoute({
    method: 'patch',
    path: '/permissions/{permissionId}',
    tags: ['Access Control'],
    summary: 'Update access-control permission',
    request: {
        params: updatePermissionSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: updatePermissionSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Permission updated successfully.',
            content: {
                'application/json': {
                    schema: updatePermissionSchema.response,
                },
            },
        },
    },
});

export const updateAccessControlPermissionRouteHandler: AppRouteHandler<
    typeof updateAccessControlPermissionRoute
> = async (c) => {
    const supabaseUser = c.get('supabaseUser') as any;
    assertSupportAccess(supabaseUser?.user_metadata?.role);
    const user = c.get('user');
    const institutionId = c.get('institutionId');

    const { permissionId } = c.req.valid('param');
    const body = c.req.valid('json');
    const data = await PermissionService.updatePermission(
        c.get('dbClient'),
        permissionId,
        body,
        user?.id,
        institutionId,
    );

    return c.json({ message: 'Access-control permission updated successfully.', data });
};
