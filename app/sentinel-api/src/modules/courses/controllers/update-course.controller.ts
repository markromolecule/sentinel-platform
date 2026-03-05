import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../types/hono';
import { updateCourseSchema } from '../courses.dto';
import { CourseService } from '../courses.service';

export const updateCourseRoute = createRoute({
    method: 'put',
    path: '/{id}',
    tags: ['Courses'],
    summary: 'Update course',
    description: 'Updates an existing course.',
    request: {
        params: updateCourseSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: updateCourseSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: updateCourseSchema.response,
                },
            },
            description: 'Course updated successfully',
        },
        404: {
            description: 'Course not found',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const updateCourseRouteHandler: AppRouteHandler<typeof updateCourseRoute> = async (c) => {
    try {
        const { id } = c.req.valid('param');
        const body = c.req.valid('json');

        const updatedCourse = await CourseService.updateCourse(c.get('dbClient'), id, {
            code: body.code,
            title: body.title,
            department_id: body.department_id,
            description: body.description,
        });

        return c.json(
            {
                message: 'Course updated successfully',
                data: {
                    course_id: updatedCourse.course_id,
                    code: updatedCourse.code,
                    title: updatedCourse.title,
                    department_id: updatedCourse.department_id,
                    description: updatedCourse.description,
                    created_at: updatedCourse.created_at,
                    updated_at: updatedCourse.updated_at,
                    created_by: updatedCourse.created_by,
                    updated_by: updatedCourse.updated_by,
                },
            },
            200,
        );
    } catch (error: any) {
        if (error.message === 'Course not found') {
            return c.json({ error: error.message }, 404);
        }
        console.error('Update course error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
