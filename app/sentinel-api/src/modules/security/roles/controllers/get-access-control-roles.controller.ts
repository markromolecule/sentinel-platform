import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { getRolesSchema } from '../roles.dto';
import { RolesService } from '../services/roles.service';
import { assertSupportAccess } from '../../access-control/services/access-control-authorization.service';

export const getAccessControlRolesRoute = createRoute({
    method: 'get',
    path: '/roles',
    tags: ['Access Control'],
    summary: 'Get access-control roles',
    responses: {
        200: {
            description: 'Roles fetched successfully.',
            content: {
                'application/json': {
                    schema: getRolesSchema.response,
                },
            },
        },
    },
});

export const getAccessControlRolesRouteHandler: AppRouteHandler<
    typeof getAccessControlRolesRoute
> = async (c) => {
    const supabaseUser = c.get('supabaseUser') as any;
    assertSupportAccess(supabaseUser?.user_metadata?.role);

    const data = await RolesService.getRoles(c.get('dbClient'));

    return c.json({ message: 'Access-control roles fetched successfully.', data });
};
