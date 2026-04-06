import { createRoute } from '@hono/zod-openapi';
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
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const institutionId = c.get('institutionId');

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

        const { search } = c.req.valid('query');
        const scope = buildRequesterAcademicScope({
            requesterRole: role,
            requesterInstitutionId: institutionId,
            requesterDepartmentId: c.get('user').user_profiles?.department_id ?? null,
            requesterCourseId: c.get('user').user_profiles?.course_id ?? null,
        });
        const queryScope = resolveAcademicQueryScope(scope);
        const sections = await SectionService.getSections(
            c.get('dbClient'),
            institutionId,
            search,
            {
                departmentId: queryScope.departmentId,
                courseId: queryScope.courseId,
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
        console.error('Fetch sections error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
