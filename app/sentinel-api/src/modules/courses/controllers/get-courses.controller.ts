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
    request: getCoursesSchema.request,
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
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const institutionId = c.get('institutionId');
        const { search } = c.req.valid('query');

        if (role !== 'admin' && role !== 'superadmin') {
            return c.json({ error: 'Forbidden. Insufficient permissions.' }, 403 as any);
        }

        if (role !== 'superadmin' && !institutionId) {
            return c.json({ message: 'No institution assigned to this admin', data: [] }, 200);
        }

        const courses = await CourseService.getCourses(c.get('dbClient'), institutionId, search);

        return c.json(
            {
                message: 'Courses fetched successfully',
                data: courses as any,
            },
            200,
        );
    } catch (error: any) {
        console.error('Fetch courses error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
