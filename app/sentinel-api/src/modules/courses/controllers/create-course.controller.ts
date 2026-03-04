import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../types/hono';
import { createCourseSchema } from '../courses.dto';
import { CourseService } from '../courses.service';

export const createCourseRoute = createRoute({
    method: 'post',
    path: '/',
    tags: ['Courses'],
    summary: 'Create course',
    description: 'Creates a new course.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createCourseSchema.body,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                'application/json': {
                    schema: createCourseSchema.response,
                },
            },
            description: 'Course created successfully',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const createCourseRouteHandler: AppRouteHandler<typeof createCourseRoute> = async (c) => {
    try {
        const body = c.req.valid('json');
        const user = c.get('user');

        const newCourse = await CourseService.createCourse(c.get('dbClient'), {
            code: body.code,
            title: body.title,
            department_id: body.department_id,
            description: body.description,
            created_by: user.id,
        });

        return c.json(
            {
                message: 'Course created successfully',
                data: {
                    course_id: newCourse.course_id,
                    code: newCourse.code,
                    title: newCourse.title,
                    department_id: newCourse.department_id,
                    description: newCourse.description,
                    created_at: newCourse.created_at,
                    updated_at: newCourse.updated_at,
                    created_by: newCourse.created_by,
                },
            },
            201,
        );
    } catch (error: any) {
        console.error('Create course error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
