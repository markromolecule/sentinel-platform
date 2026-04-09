import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { createAccessControlAssignmentSchema } from '../access-control.dto';
import { AccessControlAssignmentService } from '../services/access-control-assignment.service';
import { assertSupportAccess } from '../services/access-control-authorization.service';

export const createAccessControlAssignmentRoute = createRoute({
    method: 'post',
    path: '/assignments',
    tags: ['Access Control'],
    summary: 'Create access-control assignment',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createAccessControlAssignmentSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Assignment created successfully.',
            content: {
                'application/json': {
                    schema: createAccessControlAssignmentSchema.response,
                },
            },
        },
    },
});

export const createAccessControlAssignmentRouteHandler: AppRouteHandler<
    typeof createAccessControlAssignmentRoute
> = async (c) => {
    const supabaseUser = c.get('supabaseUser') as any;
    assertSupportAccess(supabaseUser?.user_metadata?.role);

    const body = c.req.valid('json');
    const data = await AccessControlAssignmentService.createAssignment(c.get('dbClient'), body);

    return c.json({ message: 'Access-control assignment created successfully.', data });
};
