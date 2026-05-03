import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
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
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const institutionId = c.get('institutionId');

        if (role !== 'superadmin' && role !== 'support' && !institutionId) {
            return c.json({ message: 'No institution assigned to this user', data: [] }, 200);
        }

        const { search, institutionId: queryInstitutionId, courseId: queryCourseId } = c.req.valid('query');
        
        // Prioritize query institutionId for support/superadmin, otherwise use context institutionId
        const targetInstitutionId = (role === 'superadmin' || role === 'support') && queryInstitutionId 
            ? queryInstitutionId 
            : institutionId;

        const scope = buildRequesterAcademicScope({
            requesterRole: role,
            requesterInstitutionId: targetInstitutionId,
            requesterDepartmentId: c.get('user').user_profiles?.department_id ?? null,
            requesterCourseId: c.get('user').user_profiles?.course_id ?? null,
        });
        const queryScope = resolveAcademicQueryScope(scope);
        
        const sections = await SectionService.getSections(
            c.get('dbClient'),
            queryScope.institutionId,
            search,
            {
                departmentId: queryScope.departmentId,
                courseId: queryCourseId || queryScope.courseId,
            },
        );

        return c.json(
            {
                message: 'Sections fetched successfully',
                data: sections,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Fetch sections error:');
    }
};
