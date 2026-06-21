import { Context } from 'hono';
import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler, type HonoEnv } from '../../../../types/hono';
import { getSectionsSchema } from '../sections.dto';
import { SectionService } from '../sections.service';
import {
    buildRequesterAcademicScope,
    resolveAcademicQueryScope,
} from '../../../_shared/academic-scope';

export const getSectionsRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Sections'],
    summary: 'Get all sections',
    description: 'Retrieves all sections for a specific institution.',
    request: getSectionsSchema.request,
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getSectionsSchema.response,
                },
            },
            description: 'Sections fetched successfully',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const getSectionsRouteHandler: AppRouteHandler<typeof getSectionsRoute> = async (c) => {
    try {
        requireActivePermission(c, 'sections:view', 'Forbidden. Missing sections:view permission.');
        const role = c.get('role');
        const institutionId = c.get('institutionId');

        if (role !== 'superadmin' && role !== 'support' && !institutionId) {
            return c.json({ message: 'No institution assigned to this user', data: [] }, 200);
        }

        const {
            search,
            institutionId: queryInstitutionId,
            courseId: queryCourseId,
            page,
            pageSize,
        } = c.req.valid('query');

        const scope = buildRequesterAcademicScope({
            requesterRole: role,
            requesterInstitutionId: institutionId,
            requesterDepartmentId: (c.get('user') as any).user_profiles?.department_id ?? null,
            requesterCourseId: (c.get('user') as any).user_profiles?.course_id ?? null,
        });
        const queryScope = resolveAcademicQueryScope(scope, {
            requestedInstitutionId: queryInstitutionId,
            courseId: queryCourseId,
        });

        const sections = await SectionService.getSections(
            c.get('dbClient'),
            queryScope.institutionId,
            search,
            {
                departmentId: queryScope.departmentId,
                courseId: queryCourseId || queryScope.courseId,
                page,
                pageSize,
            },
        );
        const data = Array.isArray(sections) ? sections : sections.items;
        return c.json(
            Array.isArray(sections)
                ? {
                    message: 'Sections fetched successfully',
                    data,
                }
                : {
                    message: 'Sections fetched successfully',
                    data,
                    pagination: sections.pagination,
                },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Fetch sections error:');
    }
};
