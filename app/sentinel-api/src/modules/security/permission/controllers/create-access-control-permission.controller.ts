import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { createPermissionSchema } from '../permission.dto';
import { PermissionService } from '../services/permission.service';
import { assertSupportAccess } from '../../access-control/services/access-control-authorization.service';

export const createAccessControlPermissionRoute = createRoute({
    method: 'post',
    path: '/permissions',
    tags: ['Access Control'],
    summary: 'Create access-control permission',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createPermissionSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Permission created successfully.',
            content: {
                'application/json': {
                    schema: createPermissionSchema.response,
                },
            },
        },
    },
});

export const createAccessControlPermissionRouteHandler: AppRouteHandler<
    typeof createAccessControlPermissionRoute
> = async (c) => {
    const supabaseUser = c.get('supabaseUser') as any;
    assertSupportAccess(supabaseUser?.user_metadata?.role);
    const user = c.get('user');
    const institutionId = c.get('institutionId');

    const body = c.req.valid('json');
    const data = await PermissionService.createPermission(
        c.get('dbClient'),
        body,
        user?.id,
        institutionId,
    );

    return c.json({ message: 'Access-control permission created successfully.', data });
};
