import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { getClassroomsSchema } from '../classroom.dto';
import { ClassroomService } from '../classroom.service';
import { requireActivePermission } from '../../../../lib/permissions';

export const getClassroomsRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Classrooms'],
    summary: 'Get instructor classrooms',
    description: 'Retrieves configured classrooms owned by the authenticated instructor.',
    request: getClassroomsSchema.request,
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getClassroomsSchema.response,
                },
            },
            description: 'Classrooms fetched successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        500: { description: 'Internal Server Error' },
    },
});

export const getClassroomsRouteHandler: AppRouteHandler<typeof getClassroomsRoute> = async (c) => {
    try {
        requireActivePermission(
            c,
            'classrooms:view',
            'Forbidden. Only instructors can view classrooms.',
        );

        const institutionId = c.get('institutionId');
        const user = c.get('user');
        const userRole = c.get('role');

        if (!institutionId) {
            return c.json({ error: 'Unauthorized. Institution ID not found.' }, 401 as any);
        }

        const { search, departmentId, status, subjectId } = c.req.valid('query');

        const classrooms = await ClassroomService.getClassrooms(c.get('dbClient'), {
            userId: user.id,
            institutionId,
            search,
            departmentId,
            userRole,
            status,
            subjectId,
        });

        return c.json(
            {
                message: 'Classrooms fetched successfully',
                data: classrooms,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Get classrooms error:');
    }
};
