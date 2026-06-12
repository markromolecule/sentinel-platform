import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { unarchiveClassroomSchema } from '../classroom.dto';
import { ClassroomService } from '../classroom.service';
import { requireActivePermission } from '../../../../lib/permissions';

export const unarchiveClassroomRoute = createRoute({
    method: 'patch',
    path: '/:id/unarchive',
    tags: ['Classrooms'],
    summary: 'Unarchive a classroom',
    description: 'Unarchives a previously archived classroom to make it active again.',
    request: {
        params: unarchiveClassroomSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: unarchiveClassroomSchema.response,
                },
            },
            description: 'Classroom unarchived successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Classroom not found' },
        500: { description: 'Internal Server Error' },
    },
});

export const unarchiveClassroomRouteHandler: AppRouteHandler<
    typeof unarchiveClassroomRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'classrooms:archive',
            'Forbidden. You do not have permission to unarchive classrooms.',
        );

        const institutionId = c.get('institutionId');
        const user = c.get('user');
        const userRole = c.get('role');

        if (!institutionId) {
            return c.json({ error: 'Unauthorized. Institution ID not found.' }, 401 as any);
        }

        const { id } = c.req.valid('param');

        await ClassroomService.unarchiveClassroom(c.get('dbClient'), {
            classGroupId: id,
            userId: user.id,
            institutionId,
            userRole,
        });

        return c.json(
            {
                message: 'Classroom unarchived successfully',
                data: null,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Unarchive classroom error:');
    }
};
