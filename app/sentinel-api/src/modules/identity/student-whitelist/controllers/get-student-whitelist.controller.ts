import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { getStudentWhitelistSchema } from '../student-whitelist.dto';
import { StudentWhitelistService } from '../student-whitelist.service';
import { resolveRequesterRole } from '../../../../lib/resolve-requester-role';
import { requireActivePermission } from '../../../../lib/permissions';

export const getStudentWhitelistRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Student Whitelist'],
    summary: 'Get student whitelist records',
    description: 'Retrieves whitelist records within the requester scope.',
    request: getStudentWhitelistSchema.request,
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getStudentWhitelistSchema.response,
                },
            },
            description: 'Student whitelist fetched successfully',
        },
        403: {
            description: 'Forbidden',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const getStudentWhitelistRouteHandler: AppRouteHandler<
    typeof getStudentWhitelistRoute
> = async (c) => {
    requireActivePermission(c, 'student_whitelist:view');
    try {
        const supabaseUser = c.get('supabaseUser') as any;
        const user = c.get('user');
        const institutionId = c.get('institutionId');
        const role = resolveRequesterRole(supabaseUser);
        const query = c.req.valid('query');

        const records = await StudentWhitelistService.getStudentWhitelist(c.get('dbClient'), {
            requesterRole: role,
            requesterInstitutionId: institutionId,
            requesterDepartmentId: user.user_profiles?.department_id ?? null,
            requesterCourseId: user.user_profiles?.course_id ?? null,
            queryInstitutionId: query.institution_id,
            departmentId: query.department_id,
            courseId: query.course_id,
            status: query.status,
            search: query.search,
            page: query.page,
            pageSize: query.pageSize,
        });
        const data = Array.isArray(records) ? records : records.items;

        return c.json(
            Array.isArray(records)
                ? {
                      message: 'Student whitelist fetched successfully',
                      data,
                  }
                : {
                      message: 'Student whitelist fetched successfully',
                      data,
                      pagination: records.pagination,
                  },
            200,
        );
    } catch (error: any) {
        console.error('Get student whitelist error:', error);
        if (error.message.includes('Forbidden')) {
            return c.json({ error: error.message }, 403);
        }
        return c.json({ error: error.message || 'Internal Server Error' }, 500);
    }
};
