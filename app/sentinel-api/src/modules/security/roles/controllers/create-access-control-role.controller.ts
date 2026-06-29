import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { createRoleSchema } from '../roles.dto';
import { RolesService } from '../roles.service';
import { assertSupportAccess } from '../../access-control/services/access-control-authorization.service';
import { requireActivePermission } from '../../../../lib/permissions';

export const createAccessControlRoleRoute = createRoute({
    method: 'post',
    path: '/roles',
    tags: ['Access Control'],
    summary: 'Create access-control role',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createRoleSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Role created successfully.',
            content: {
                'application/json': {
                    schema: createRoleSchema.response,
                },
            },
        },
    },
});

export const createAccessControlRoleRouteHandler: AppRouteHandler<
    typeof createAccessControlRoleRoute
> = async (c) => {
    const supabaseUser = c.get('supabaseUser') as any;
    assertSupportAccess(supabaseUser?.user_metadata?.role);
    requireActivePermission(c, 'access_control:create_role');
    const user = c.get('user');
    const institutionId = c.get('institutionId');

    const body = c.req.valid('json');
    const data = await RolesService.createRole(c.get('dbClient'), body, user?.id, institutionId);

    return c.json({ message: 'Access-control role created successfully.', data });
};
