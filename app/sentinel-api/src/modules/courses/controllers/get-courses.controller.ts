import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../types/hono';
import { getCoursesSchema } from '../courses.dto';
import { CourseService } from '../courses.service';

export const getCoursesRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Courses'],
    summary: 'Get all courses',
    description: 'Retrieves all courses.',
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getCoursesSchema.response,
                },
            },
            description: 'Courses fetched successfully',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const getCoursesRouteHandler: AppRouteHandler<typeof getCoursesRoute> = async (c) => {
    try {
        const rawCourses = await CourseService.getCourses(c.get('dbClient'));

        const courses = rawCourses.map((course: any) => ({
            course_id: course.course_id,
            code: course.code,
            title: course.title,
            department_id: course.department_id,
            description: course.description,
            created_at: course.created_at,
            updated_at: course.updated_at,
            created_by: course.created_by,
        }));

        return c.json(
            {
                message: 'Courses fetched successfully',
                data: courses,
            },
            200,
        );
    } catch (error: any) {
        console.error('Fetch courses error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
