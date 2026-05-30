import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { flagClassroomAssignmentSchema } from '../classroom.dto';
import { ClassroomService } from '../classroom.service';
import { requireActivePermission } from '../../../../lib/permissions';

export const flagClassroomAssignmentRoute = createRoute({
    method: 'post',
    path: '/:id/instructors/flag',
    tags: ['Classrooms'],
    summary: 'Flag classroom assignment',
    description: 'Flags the instructor assignment to a classroom due to conflict, workload, etc.',
    request: {
        params: flagClassroomAssignmentSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: flagClassroomAssignmentSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: flagClassroomAssignmentSchema.response,
                },
            },
            description: 'Classroom assignment flagged successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Assignment not found' },
        500: { description: 'Internal Server Error' },
    },
});

export const flagClassroomAssignmentRouteHandler: AppRouteHandler<
    typeof flagClassroomAssignmentRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'classrooms:update',
            'Forbidden. You do not have permission to manage classroom instructors.',
        );

        const user = c.get('user');
        const { id } = c.req.valid('param');
        const payload = c.req.valid('json');

        await ClassroomService.flagClassroomAssignment(c.get('dbClient'), {
            classGroupId: id,
            instructorUserId: user.id,
            flagReason: payload.flagReason,
            justification: payload.justification,
        });

        return c.json({
            message: 'Classroom assignment flagged successfully',
            data: null,
        });
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Flag classroom assignment error:');
    }
};
