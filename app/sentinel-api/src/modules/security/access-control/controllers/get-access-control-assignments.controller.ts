import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { getAccessControlAssignmentsSchema } from '../access-control.dto';
import { AccessControlAssignmentService } from '../services/access-control-assignment.service';
import { assertSupportAccess } from '../services/access-control-authorization.service';

export const getAccessControlAssignmentsRoute = createRoute({
    method: 'get',
    path: '/assignments',
    tags: ['Access Control'],
    summary: 'Get access-control assignments',
    responses: {
        200: {
            description: 'Assignments fetched successfully.',
            content: {
                'application/json': {
                    schema: getAccessControlAssignmentsSchema.response,
                },
            },
        },
    },
});

export const getAccessControlAssignmentsRouteHandler: AppRouteHandler<
    typeof getAccessControlAssignmentsRoute
> = async (c) => {
    const supabaseUser = c.get('supabaseUser') as any;
    assertSupportAccess(supabaseUser?.user_metadata?.role);

    const data = await AccessControlAssignmentService.getAssignments(c.get('dbClient'));

    return c.json({ message: 'Access-control assignments fetched successfully.', data });
};
