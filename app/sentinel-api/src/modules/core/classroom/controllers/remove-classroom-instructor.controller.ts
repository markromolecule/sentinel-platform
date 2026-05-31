import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { removeClassroomInstructorSchema } from '../classroom.dto';
import { ClassroomService } from '../classroom.service';
import { requireActivePermission } from '../../../../lib/permissions';

export const removeClassroomInstructorRoute = createRoute({
    method: 'delete',
    path: '/:id/instructors/:userId',
    tags: ['Classrooms'],
    summary: 'Remove an instructor from a classroom',
    description: 'Removes a delegated instructor from a classroom while preserving head ownership.',
    request: {
        params: removeClassroomInstructorSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: removeClassroomInstructorSchema.response,
                },
            },
            description: 'Classroom instructor removed successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Classroom or instructor assignment not found' },
        409: { description: 'Head instructor cannot be removed' },
        500: { description: 'Internal Server Error' },
    },
});

export const removeClassroomInstructorRouteHandler: AppRouteHandler<
    typeof removeClassroomInstructorRoute
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

        const { id, userId } = c.req.valid('param');
        const userRole = c.get('role');
        await ClassroomService.removeClassroomInstructor(c.get('dbClient'), {
            classGroupId: id,
            instructorUserId: userId,
            userId: user.id,
            institutionId,
            userRole,
        });

        return c.json({
            message: 'Classroom instructor removed successfully',
            data: null,
        });
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Remove classroom instructor error:');
    }
};
