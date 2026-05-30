import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { createClassroomSchema } from '../classroom.dto';
import { ClassroomService } from '../classroom.service';
import { requireActivePermission } from '../../../../lib/permissions';

export const createClassroomRoute = createRoute({
    method: 'post',
    path: '/',
    tags: ['Classrooms'],
    summary: 'Configure a classroom from an existing class group',
    description: 'Assigns a classroom name to an instructor-accessible class group.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createClassroomSchema.body,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                'application/json': {
                    schema: createClassroomSchema.response,
                },
            },
            description: 'Classroom created successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Class group not found' },
        409: { description: 'Classroom already configured' },
        500: { description: 'Internal Server Error' },
    },
});

export const createClassroomRouteHandler: AppRouteHandler<typeof createClassroomRoute> = async (
    c,
) => {
    try {
        requireActivePermission(
            c,
            'classrooms:create',
            'Forbidden. Only instructors can configure classrooms.',
        );

        const institutionId = c.get('institutionId');
        const user = c.get('user');
        const userRole = c.get('role');

        if (!institutionId) {
            return c.json({ error: 'Unauthorized. Institution ID not found.' }, 401 as any);
        }

        const payload = c.req.valid('json');
        const classroom = await ClassroomService.createClassroom(c.get('dbClient'), {
            payload,
            userId: user.id,
            institutionId,
            userRole,
        });

        return c.json(
            {
                message: 'Classroom created successfully',
                data: classroom,
            },
            201,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Create classroom error:');
    }
};
