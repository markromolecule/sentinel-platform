import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { bulkAssignInstructorsSchema } from '../classroom.dto';
import { ClassroomService } from '../classroom.service';
import { requireActivePermission } from '../../../../lib/permissions';

export const bulkAssignClassroomInstructorsRoute = createRoute({
    method: 'post',
    path: '/dashboard/bulk-assign',
    tags: ['Classrooms'],
    summary: 'Bulk assign instructors to classrooms',
    description: 'Allows an administrator to assign multiple instructors to multiple classrooms in a single request.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: bulkAssignInstructorsSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: bulkAssignInstructorsSchema.response,
                },
            },
            description: 'Bulk assignment processed',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        500: { description: 'Internal Server Error' },
    },
});

export const bulkAssignClassroomInstructorsRouteHandler: AppRouteHandler<
    typeof bulkAssignClassroomInstructorsRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'classrooms:update',
            'Forbidden. You do not have permission to manage classroom instructors.',
        );

        const institutionId = c.get('institutionId');
        const user = c.get('user');

        if (!institutionId) {
            return c.json({ error: 'Unauthorized. Institution ID not found.' }, 401 as any);
        }

        const payload = c.req.valid('json');

        const results = await ClassroomService.bulkAssignClassroomInstructors(c.get('dbClient'), {
            assignments: payload.assignments,
            actorUserId: user.id,
            institutionId,
        });

        return c.json({
            message: 'Bulk assignment processed',
            data: results,
        });
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Bulk assign instructors error:');
    }
};
