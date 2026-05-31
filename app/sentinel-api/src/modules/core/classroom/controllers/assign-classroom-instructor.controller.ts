import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { assignClassroomInstructorSchema } from '../classroom.dto';
import { ClassroomService } from '../classroom.service';
import { requireActivePermission } from '../../../../lib/permissions';

export const assignClassroomInstructorRoute = createRoute({
    method: 'post',
    path: '/:id/instructors',
    tags: ['Classrooms'],
    summary: 'Assign an instructor to a classroom',
    description: 'Adds an instructor to a classroom while preserving the current head instructor.',
    request: {
        params: assignClassroomInstructorSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: assignClassroomInstructorSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: assignClassroomInstructorSchema.response,
                },
            },
            description: 'Classroom instructor assigned successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Classroom or instructor not found' },
        409: { description: 'Instructor already assigned' },
        500: { description: 'Internal Server Error' },
    },
});

export const assignClassroomInstructorRouteHandler: AppRouteHandler<
    typeof assignClassroomInstructorRoute
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

        const { id } = c.req.valid('param');
        const payload = c.req.valid('json');
        const userRole = c.get('role');
        const instructors = await ClassroomService.assignClassroomInstructor(c.get('dbClient'), {
            classGroupId: id,
            payload,
            userId: user.id,
            institutionId,
            userRole,
        });

        return c.json({
            message: 'Classroom instructor assigned successfully',
            data: instructors,
        });
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Assign classroom instructor error:');
    }
};
