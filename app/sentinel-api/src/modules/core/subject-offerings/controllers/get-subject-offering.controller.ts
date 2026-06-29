import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { getSubjectOfferingByIdSchema } from '../subject-offerings.dto';
import { SubjectOfferingsService } from '../subject-offerings.service';
import { extractErrorCode } from '../../subjects/helper/error-utils';
import {
    buildRequesterAcademicScope,
    assertSubjectOfferingRecordInScope,
} from '../../../_shared/academic-scope';

export const getSubjectOfferingRoute = createRoute({
    method: 'get',
    path: '/{id}',
    tags: ['Subject Offerings'],
    summary: 'Get a subject offering by ID',
    description: 'Retrieves details of a single subject offering.',
    request: {
        params: getSubjectOfferingByIdSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getSubjectOfferingByIdSchema.response,
                },
            },
            description: 'Subject offering retrieved successfully',
        },
        404: { description: 'Subject offering not found' },
        500: { description: 'Internal Server Error' },
    },
});

export const getSubjectOfferingRouteHandler: AppRouteHandler<
    typeof getSubjectOfferingRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'subject_offerings:view',
            'Forbidden. Missing subject_offerings:view permission.',
        );
        const { id } = c.req.valid('param');
        const user = c.get('user');
        const supabaseUser = c.get('supabaseUser') as any;
        const scope = buildRequesterAcademicScope({
            requesterRole: supabaseUser?.user_metadata?.role,
            requesterInstitutionId: c.get('institutionId'),
            requesterDepartmentId: user.user_profiles?.department_id ?? null,
            requesterCourseId: user.user_profiles?.course_id ?? null,
        });

        const subjectOffering = await SubjectOfferingsService.getSubjectOfferingById(
            c.get('dbClient'),
            id,
            c.get('institutionId'),
        );

        // Assert record is within scope for department/course constraints if applicable
        assertSubjectOfferingRecordInScope(scope, {
            departmentIds: subjectOffering.department_ids,
            courseIds: subjectOffering.course_ids,
        });

        return c.json(
            {
                message: 'Subject offering retrieved successfully',
                data: subjectOffering,
            },
            200,
        );
    } catch (error: any) {
        const code = extractErrorCode(error);

        if (
            code === 'P2025' ||
            error?.message === 'No result' ||
            error?.message === 'no result' ||
            error?.name === 'NoResultError'
        ) {
            return c.json({ error: 'Subject offering not found' }, 404);
        }

        return respondWithRouteError(c, error, 'Get subject offering by ID error:');
    }
};
