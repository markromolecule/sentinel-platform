import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { getClassroomSchema } from '../classroom.dto';
import { ClassroomService } from '../classroom.service';
import { requireActivePermission } from '../../../../lib/permissions';

export const getClassroomRoute = createRoute({
    method: 'get',
    path: '/:id',
    tags: ['Classrooms'],
    summary: 'Get classroom detail',
    description: 'Retrieves a single instructor-scoped classroom with metadata and counts.',
    request: {
        params: getClassroomSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getClassroomSchema.response,
                },
            },
            description: 'Classroom fetched successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Classroom not found' },
        500: { description: 'Internal Server Error' },
    },
});

export const getClassroomRouteHandler: AppRouteHandler<typeof getClassroomRoute> = async (c) => {
    try {
        requireActivePermission(
            c,
            ['classrooms:view', 'classrooms:view_enrolled'],
            'Forbidden. You do not have permission to view this classroom.',
        );

        const institutionId = c.get('institutionId');
        const user = c.get('user');

        if (!institutionId) {
            return c.json({ error: 'Unauthorized. Institution ID not found.' }, 401 as any);
        }

        const { id } = c.req.valid('param');
        const classroom = await ClassroomService.getClassroomById(c.get('dbClient'), {
            classGroupId: id,
            userId: user.id,
            institutionId,
        });

        return c.json(
            {
                message: 'Classroom fetched successfully',
                data: classroom,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Get classroom error:');
    }
};
