import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '@/types/hono';
import { deleteCourseSchema } from '../courses.dto';
import { CourseService } from '../courses.service';

export const deleteCourseRoute = createRoute({
    method: 'delete',
    path: '/{id}',
    tags: ['Courses'],
    summary: 'Delete course',
    description: 'Deletes an existing course.',
    request: {
        params: deleteCourseSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: deleteCourseSchema.response,
                },
            },
            description: 'Course deleted successfully',
        },
        404: {
            description: 'Course not found',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const deleteCourseRouteHandler: AppRouteHandler<typeof deleteCourseRoute> = async (c) => {
    try {
        const { id } = c.req.valid('param');

        await CourseService.deleteCourse(c.get('dbClient'), id);

        return c.json(
            {
                message: 'Course deleted successfully',
                data: null,
            },
            200,
        );
    } catch (error: any) {
        if (error.message === 'Course not found') {
            return c.json({ error: error.message }, 404);
        }
        console.error('Delete course error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
