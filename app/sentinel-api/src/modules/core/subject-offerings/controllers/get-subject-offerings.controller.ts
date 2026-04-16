import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { getSubjectOfferingsSchema } from '../subject-offerings.dto';
import { SubjectOfferingsService } from '../subject-offerings.service';
import {
    buildRequesterAcademicScope,
    resolveAcademicQueryScope,
} from '../../../_shared/academic-scope';

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
        requireActivePermission(
            c,
            'subject_offerings:view',
            'Forbidden. Missing subject_offerings:view permission.',
        );
        const { search, subject_id, term_id, visibility } = c.req.valid('query');
        const supabaseUser = c.get('supabaseUser') as any;
        const requesterRole = supabaseUser?.user_metadata?.role;
        const instructorDepartmentId = c.get('user').user_profiles?.department_id ?? null;
        const scope = buildRequesterAcademicScope({
            requesterRole,
            requesterInstitutionId: c.get('institutionId'),
            requesterDepartmentId: instructorDepartmentId,
            requesterCourseId: c.get('user').user_profiles?.course_id ?? null,
        });
        const defaultQueryScope = resolveAcademicQueryScope(scope);
        const queryScope =
            requesterRole === 'instructor'
                ? {
                      institutionId: defaultQueryScope.institutionId,
                      departmentId: undefined,
                      courseId: undefined,
                  }
                : defaultQueryScope;
        const subjectOfferings = await SubjectOfferingsService.getSubjectOfferings(
            c.get('dbClient'),
            {
                institutionId: queryScope.institutionId,
                departmentId: queryScope.departmentId,
                courseId: queryScope.courseId,
                search,
                subjectId: subject_id,
                termId: term_id,
                visibility,
                instructorDepartmentId: instructorDepartmentId ?? undefined,
            },
        );

        return c.json(
            {
                message: 'Subject offerings retrieved successfully',
                data: subjectOfferings,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Get subject offerings error:');
    }
};
