import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { getStudentClassroomsSchema } from '../enrollments.dto';
import { EnrollmentService } from '../enrollments.service';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { requireActivePermission } from '../../../../lib/permissions';

export const getStudentClassroomsRoute = createRoute({
    method: 'get',
    path: '/student/classrooms',
    tags: ['Enrollments', 'Student'],
    summary: 'Get enrolled classrooms for the student',
    description: 'Retrieves all subjects and sections the student is enrolled in.',
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getStudentClassroomsSchema.response,
                },
            },
            description: 'Student classrooms retrieved successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        500: { description: 'Internal Server Error' },
    },
});

export const getStudentClassroomsRouteHandler: AppRouteHandler<
    typeof getStudentClassroomsRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'classrooms:view_enrolled',
            'Forbidden. Only students can get their classrooms.',
        );

        const userId = c.get('user')?.id;
        if (!userId) {
            return c.json({ error: 'Unauthorized' }, 401 as any);
        }

        const classrooms = await EnrollmentService.getStudentClassrooms(c.get('dbClient'), userId);

        return c.json(
            {
                message: 'Student classrooms retrieved successfully',
                data: classrooms,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Get student classrooms error:');
    }
};
