import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { acknowledgeClassroomAssignmentSchema } from '../classroom.dto';
import { ClassroomService } from '../classroom.service';
import { requireActivePermission } from '../../../../lib/permissions';

export const acknowledgeClassroomAssignmentRoute = createRoute({
    method: 'post',
    path: '/:id/instructors/acknowledge',
    tags: ['Classrooms'],
    summary: 'Acknowledge classroom assignment',
    description: 'Acknowledges the instructor assignment to a classroom.',
    request: {
        params: acknowledgeClassroomAssignmentSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: acknowledgeClassroomAssignmentSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: acknowledgeClassroomAssignmentSchema.response,
                },
            },
            description: 'Classroom assignment acknowledged successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Assignment not found' },
        500: { description: 'Internal Server Error' },
    },
});

export const acknowledgeClassroomAssignmentRouteHandler: AppRouteHandler<
    typeof acknowledgeClassroomAssignmentRoute
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

        await ClassroomService.acknowledgeClassroomAssignment(c.get('dbClient'), {
            classGroupId: id,
            instructorUserId: user.id,
            justification: payload.justification,
        });

        return c.json({
            message: 'Classroom assignment acknowledged successfully',
            data: null,
        });
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Acknowledge classroom assignment error:');
    }
};
