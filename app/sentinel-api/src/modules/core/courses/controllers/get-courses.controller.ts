import { Context } from 'hono';
import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler, type HonoEnv } from '../../../../types/hono';
import { getCoursesSchema } from '../courses.dto';
import { CourseService } from '../courses.service';
import {
    buildRequesterAcademicScope,
    resolveAcademicQueryScope,
} from '../../../_shared/academic-scope';
import { requireActivePermission } from '../../../../lib/permissions';

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
        const role = c.get('role');
        const institutionId = c.get('institutionId');
        const {
            search,
            institutionId: queryInstitutionId,
            departmentId: queryDepartmentId,
            page,
            pageSize,
        } = c.req.valid('query');

        requireActivePermission(c, 'courses:view', 'Forbidden. Missing courses:view permission.');

        if (role !== 'superadmin' && role !== 'support' && !institutionId) {
            return c.json({ message: 'No institution assigned to this user', data: [] }, 200);
        }

        const scope = buildRequesterAcademicScope({
            requesterRole: role,
            requesterInstitutionId: institutionId,
            requesterDepartmentId: c.get('user').user_profiles?.department_id ?? null,
            requesterCourseId: c.get('user').user_profiles?.course_id ?? null,
        });
        const queryScope = resolveAcademicQueryScope(scope, {
            requestedInstitutionId: queryInstitutionId,
            departmentId: queryDepartmentId,
        });
        const courses = await CourseService.getCourses(
            c.get('dbClient'),
            queryScope.institutionId,
            search,
            {
                departmentId: queryScope.departmentId,
                courseId: queryScope.courseId,
                page,
                pageSize,
            },
        );
        const data = Array.isArray(courses) ? courses : courses.items;

        return c.json(
            Array.isArray(courses)
                ? {
                    message: 'Courses fetched successfully',
                    data,
                }
                : {
                    message: 'Courses fetched successfully',
                    data,
                    pagination: courses.pagination,
                },
            200,
        );
    } catch (error: any) {
        if (error?.status) {
            return c.json({ error: error.message }, error.status);
        }
        console.error('Fetch courses error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
