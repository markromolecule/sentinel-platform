import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { getClassroomInstructorsSchema } from '../classroom.dto';
import { ClassroomService } from '../classroom.service';
import { requireActivePermission } from '../../../../lib/permissions';

export const getClassroomInstructorsRoute = createRoute({
    method: 'get',
    path: '/:id/instructors',
    tags: ['Classrooms'],
    summary: 'List classroom instructors',
    description:
        'Retrieves instructor membership for a classroom, including head-instructor status.',
    request: {
        params: getClassroomInstructorsSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getClassroomInstructorsSchema.response,
                },
            },
            description: 'Classroom instructors fetched successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Classroom not found' },
        500: { description: 'Internal Server Error' },
    },
});

export const getClassroomInstructorsRouteHandler: AppRouteHandler<
    typeof getClassroomInstructorsRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            ['classrooms:view', 'classrooms:view_enrolled'],
            'Forbidden. You do not have permission to view classroom instructors.',
        );

        const institutionId = c.get('institutionId');
        const user = c.get('user');

        if (!institutionId) {
            return c.json({ error: 'Unauthorized. Institution ID not found.' }, 401 as any);
        }

        const { id } = c.req.valid('param');
        const instructors = await ClassroomService.getClassroomInstructors(c.get('dbClient'), {
            classGroupId: id,
            userId: user.id,
            institutionId,
        });

        return c.json({
            message: 'Classroom instructors fetched successfully',
            data: instructors,
        });
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Get classroom instructors error:');
    }
};
