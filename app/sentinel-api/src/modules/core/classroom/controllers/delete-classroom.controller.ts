import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { deleteClassroomSchema } from '../classroom.dto';
import { ClassroomService } from '../classroom.service';
import { requireActivePermission } from '../../../../lib/permissions';

export const deleteClassroomRoute = createRoute({
    method: 'delete',
    path: '/:id',
    tags: ['Classrooms'],
    summary: 'Delete a classroom',
    description: 'Deletes an instructor-accessible classroom and its associated roster entries.',
    request: {
        params: deleteClassroomSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: deleteClassroomSchema.response,
                },
            },
            description: 'Classroom deleted successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Classroom not found' },
        500: { description: 'Internal Server Error' },
    },
});

export const deleteClassroomRouteHandler: AppRouteHandler<typeof deleteClassroomRoute> = async (
    c,
) => {
    try {
        requireActivePermission(
            c,
            'classrooms:delete',
            'Forbidden. Only instructors can delete classrooms.',
        );

        const institutionId = c.get('institutionId');
        const user = c.get('user');

        if (!institutionId) {
            return c.json({ error: 'Unauthorized. Institution ID not found.' }, 401 as any);
        }

        const { id } = c.req.valid('param');

        await ClassroomService.deleteClassroom(c.get('dbClient'), {
            classGroupId: id,
            userId: user.id,
            institutionId,
        });

        return c.json(
            {
                message: 'Classroom deleted successfully',
                data: null,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Delete classroom error:');
    }
};
