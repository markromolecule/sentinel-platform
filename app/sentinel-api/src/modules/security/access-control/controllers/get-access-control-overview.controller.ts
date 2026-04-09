import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { getAccessControlOverviewSchema } from '../access-control.dto';
import { AccessControlOverviewService } from '../services/access-control-overview.service';
import { assertSupportAccess } from '../services/access-control-authorization.service';

export const getAccessControlOverviewRoute = createRoute({
    method: 'get',
    path: '/overview',
    tags: ['Access Control'],
    summary: 'Get support access-control overview',
    responses: {
        200: {
            description: 'Access-control overview fetched successfully.',
            content: {
                'application/json': {
                    schema: getAccessControlOverviewSchema.response,
                },
            },
        },
    },
});

export const getAccessControlOverviewRouteHandler: AppRouteHandler<
    typeof getAccessControlOverviewRoute
> = async (c) => {
    const supabaseUser = c.get('supabaseUser') as any;
    assertSupportAccess(supabaseUser?.user_metadata?.role);

    const data = await AccessControlOverviewService.getOverview(c.get('dbClient'));

    return c.json({ message: 'Access-control overview fetched successfully.', data });
};
