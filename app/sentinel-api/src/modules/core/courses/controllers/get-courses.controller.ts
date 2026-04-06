import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '@/types/hono';
import { getCoursesSchema } from '../courses.dto';
import { CourseService } from '../courses.service';
import {
    buildRequesterAcademicScope,
    resolveAcademicQueryScope,
} from '@/modules/_shared/academic-scope';

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

        if (
            role !== 'admin' &&
            role !== 'superadmin' &&
            role !== 'instructor' &&
            role !== 'support'
        ) {
            return c.json({ error: 'Forbidden. Insufficient permissions.' }, 403 as any);
        }

        if (role !== 'superadmin' && !institutionId) {
            return c.json({ message: 'No institution assigned to this user', data: [] }, 200);
        }

        const scope = buildRequesterAcademicScope({
            requesterRole: role,
            requesterInstitutionId: institutionId,
            requesterDepartmentId: c.get('user').user_profiles?.department_id ?? null,
            requesterCourseId: c.get('user').user_profiles?.course_id ?? null,
        });
        const queryScope = resolveAcademicQueryScope(scope);
        const courses = await CourseService.getCourses(c.get('dbClient'), institutionId, search, {
            departmentId: queryScope.departmentId,
            courseId: queryScope.courseId,
        });

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
