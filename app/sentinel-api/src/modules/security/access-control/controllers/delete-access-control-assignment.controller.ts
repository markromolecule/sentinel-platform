import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { deleteAccessControlAssignmentSchema } from '../access-control.dto';
import { AccessControlAssignmentService } from '../services/access-control-assignment.service';
import { assertSupportAccess } from '../services/access-control-authorization.service';

export const deleteAccessControlAssignmentRoute = createRoute({
    method: 'delete',
    path: '/assignments/{userId}/{roleId}',
    tags: ['Access Control'],
    summary: 'Delete access-control assignment',
    request: {
        params: deleteAccessControlAssignmentSchema.params,
    },
    responses: {
        200: {
            description: 'Assignment deleted successfully.',
            content: {
                'application/json': {
                    schema: deleteAccessControlAssignmentSchema.response,
                },
            },
        },
    },
});

export const deleteAccessControlAssignmentRouteHandler: AppRouteHandler<
    typeof deleteAccessControlAssignmentRoute
> = async (c) => {
    const supabaseUser = c.get('supabaseUser') as any;
    assertSupportAccess(supabaseUser?.user_metadata?.role);
    const user = c.get('user');
    const institutionId = c.get('institutionId');

    const { userId, roleId } = c.req.valid('param');
    await AccessControlAssignmentService.deleteAssignment(
        c.get('dbClient'),
        userId,
        roleId,
        user?.id,
        institutionId,
    );

    return c.json({ message: 'Access-control assignment deleted successfully.', data: null });
};
