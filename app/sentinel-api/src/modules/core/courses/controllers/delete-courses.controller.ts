import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { deleteCoursesSchema } from '../courses.dto';
import { CourseService } from '../courses.service';

export const deleteCoursesRoute = createRoute({
    method: 'post',
    path: '/bulk-delete',
    tags: ['Courses', 'Admin'],
    summary: 'Bulk delete courses',
    description: 'Deletes multiple courses at once.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: deleteCoursesSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: deleteCoursesSchema.response,
                },
            },
            description: 'Courses deleted successfully',
        },
        400: { description: 'Bad Request' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Not Found' },
        500: { description: 'Internal Server Error' },
    },
});

export const deleteCoursesRouteHandler: AppRouteHandler<typeof deleteCoursesRoute> = async (c) => {
    try {
        requireActivePermission(
            c,
            'courses:delete',
            'Forbidden. Missing courses:delete permission.',
        );

        const { ids } = c.req.valid('json');
        const institutionId = c.get('institutionId');

        await CourseService.deleteCourses(c.get('dbClient'), ids, institutionId);

        return c.json(
            {
                message: 'Courses deleted successfully',
                data: null,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Bulk delete courses error:');
    }
};
