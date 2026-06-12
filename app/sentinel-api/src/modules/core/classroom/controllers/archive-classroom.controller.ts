import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { archiveClassroomSchema } from '../classroom.dto';
import { ClassroomService } from '../classroom.service';
import { requireActivePermission } from '../../../../lib/permissions';

export const archiveClassroomRoute = createRoute({
    method: 'patch',
    path: '/:id/archive',
    tags: ['Classrooms'],
    summary: 'Archive a classroom',
    description: 'Archives a classroom to hide it from listings by default.',
    request: {
        params: archiveClassroomSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: archiveClassroomSchema.response,
                },
            },
            description: 'Classroom archived successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Classroom not found' },
        500: { description: 'Internal Server Error' },
    },
});

export const archiveClassroomRouteHandler: AppRouteHandler<typeof archiveClassroomRoute> = async (
    c,
) => {
    try {
        requireActivePermission(
            c,
            'classrooms:archive',
            'Forbidden. You do not have permission to archive classrooms.',
        );

        const institutionId = c.get('institutionId');
        const user = c.get('user');
        const userRole = c.get('role');

        if (!institutionId) {
            return c.json({ error: 'Unauthorized. Institution ID not found.' }, 401 as any);
        }

        const { id } = c.req.valid('param');

        await ClassroomService.archiveClassroom(c.get('dbClient'), {
            classGroupId: id,
            userId: user.id,
            institutionId,
            userRole,
        });

        return c.json(
            {
                message: 'Classroom archived successfully',
                data: null,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Archive classroom error:');
    }
};
