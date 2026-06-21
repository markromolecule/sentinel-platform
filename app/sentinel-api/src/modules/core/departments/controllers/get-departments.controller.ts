import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { getDepartmentsSchema } from '../departments.dto';
import { DepartmentService } from '../departments.service';
import {
    buildRequesterAcademicScope,
    resolveAcademicQueryScope,
} from '../../../_shared/academic-scope';

export const getDepartmentsRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Departments'],
    summary: 'Get all departments',
    description: 'Retrieves all departments.',
    request: getDepartmentsSchema.request,
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getDepartmentsSchema.response,
                },
            },
            description: 'Departments fetched successfully',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const getDepartmentsRouteHandler: AppRouteHandler<typeof getDepartmentsRoute> = async (
    c,
) => {
    try {
        requireActivePermission(
            c,
            'departments:view',
            'Forbidden. Missing departments:view permission.',
        );
        const role = c.get('role');
        const institutionId = c.get('institutionId');

        // Regular admins MUST have an institution assigned
        if (role !== 'superadmin' && role !== 'support' && !institutionId) {
            return c.json(
                {
                    message: 'No institution assigned to this user',
                    data: [],
                },
                200,
            );
        }

        const { search, institutionId: queryInstitutionId, page, pageSize } = c.req.valid('query');
        const scope = buildRequesterAcademicScope({
            requesterRole: role,
            requesterInstitutionId: institutionId,
            requesterDepartmentId: (c.get('user') as any).user_profiles?.department_id ?? null,
            requesterCourseId: (c.get('user') as any).user_profiles?.course_id ?? null,
        });
        const queryScope = resolveAcademicQueryScope(scope, {
            requestedInstitutionId: queryInstitutionId,
        });

        const departments = await DepartmentService.getDepartments(
            c.get('dbClient'),
            queryScope.institutionId,
            search,
            queryScope.departmentId,
            page,
            pageSize,
        );
        const data = Array.isArray(departments) ? departments : departments.items;

        return c.json(
            Array.isArray(departments)
                ? {
                      message: 'Departments fetched successfully',
                      data,
                  }
                : {
                      message: 'Departments fetched successfully',
                      data,
                      pagination: departments.pagination,
                  },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Fetch departments error:');
    }
};
