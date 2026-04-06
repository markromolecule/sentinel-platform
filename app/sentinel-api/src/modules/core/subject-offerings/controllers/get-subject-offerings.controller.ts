import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '@/types/hono';
import { getSubjectOfferingsSchema } from '../subject-offerings.dto';
import { SubjectOfferingsService } from '../subject-offerings.service';
import { mapSubjectOfferingResponse } from '../helper/map-subject-offering-response';
import {
    buildRequesterAcademicScope,
    resolveAcademicQueryScope,
} from '@/modules/_shared/academic-scope';

export const getSubjectOfferingsRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Subject Offerings'],
    summary: 'Get all subject offerings',
    description: 'Retrieves a list of subject offerings.',
    request: getSubjectOfferingsSchema.request,
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getSubjectOfferingsSchema.response,
                },
            },
            description: 'Subject offerings retrieved successfully',
        },
        500: { description: 'Internal Server Error' },
    },
});

export const getSubjectOfferingsRouteHandler: AppRouteHandler<
    typeof getSubjectOfferingsRoute
> = async (c) => {
    try {
        const { search, subject_id, term_id } = c.req.valid('query');
        const supabaseUser = c.get('supabaseUser') as any;
        const scope = buildRequesterAcademicScope({
            requesterRole: supabaseUser?.user_metadata?.role,
            requesterInstitutionId: c.get('institutionId'),
            requesterDepartmentId: c.get('user').user_profiles?.department_id ?? null,
            requesterCourseId: c.get('user').user_profiles?.course_id ?? null,
        });
        const queryScope = resolveAcademicQueryScope(scope);
        const rawSubjectOfferings = await SubjectOfferingsService.getSubjectOfferings(
            c.get('dbClient'),
            {
                institutionId: queryScope.institutionId,
                departmentId: queryScope.departmentId,
                courseId: queryScope.courseId,
                search,
                subjectId: subject_id,
                termId: term_id,
            },
        );

        return c.json(
            {
                message: 'Subject offerings retrieved successfully',
                data: rawSubjectOfferings.map(mapSubjectOfferingResponse),
            },
            200,
        );
    } catch (error: any) {
        console.error('Get subject offerings error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
