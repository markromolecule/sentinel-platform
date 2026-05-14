import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { extractErrorCode } from '../../subjects/helper/error-utils';
import {
    assertSubjectOfferingMutationAccess,
    buildRequesterAcademicScope,
    resolveSubjectOfferingAssignmentsForScope,
} from '../../../_shared/academic-scope';
import { createSubjectOfferingsFromClassificationSchema } from '../subject-offerings.dto';
import { SubjectOfferingsService } from '../subject-offerings.service';

export const createSubjectOfferingsFromClassificationRoute = createRoute({
    method: 'post',
    path: '/bulk/classification',
    tags: ['Subject Offerings'],
    summary: 'Create subject offerings from a classification',
    description:
        'Creates subject offerings for every subject assigned to a subject classification.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createSubjectOfferingsFromClassificationSchema.body,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                'application/json': {
                    schema: createSubjectOfferingsFromClassificationSchema.response,
                },
            },
            description: 'Subject offerings created from classification successfully',
        },
        400: { description: 'Bad Request' },
        403: { description: 'Forbidden' },
        404: { description: 'Subject classification or term not found' },
        409: { description: 'Conflict' },
        500: { description: 'Internal Server Error' },
    },
});

export const createSubjectOfferingsFromClassificationRouteHandler: AppRouteHandler<
    typeof createSubjectOfferingsFromClassificationRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'subject_offerings:offer',
            'Forbidden. Missing subject_offerings:offer permission.',
        );

        const body = c.req.valid('json');
        const user = c.get('user');
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const targetInstitutionId =
            role === 'support'
                ? (body.institution_id ?? c.get('institutionId'))
                : c.get('institutionId');
        const scope = buildRequesterAcademicScope({
            requesterRole: role,
            requesterInstitutionId: targetInstitutionId,
            requesterDepartmentId: user.user_profiles?.department_id ?? null,
            requesterCourseId: user.user_profiles?.course_id ?? null,
        });

        assertSubjectOfferingMutationAccess(scope);

        const assignments = await resolveSubjectOfferingAssignmentsForScope(
            c.get('dbClient'),
            scope,
            {
                departmentIds: body.department_ids,
                courseIds: body.course_ids,
                sectionIds: body.section_ids,
                yearLevels: body.year_levels,
            },
        );

        const result = await SubjectOfferingsService.createSubjectOfferingsFromClassification(
            c.get('dbClient'),
            {
                subject_classification_id: body.subject_classification_id,
                term_id: body.term_id,
                department_ids: assignments.departmentIds,
                course_ids: assignments.courseIds,
                section_ids: assignments.sectionIds,
                year_levels: assignments.yearLevels,
                duplicate_strategy: body.duplicate_strategy,
                created_by: user.id,
                institution_id: targetInstitutionId,
            },
        );

        return c.json(
            {
                message: 'Subject offerings created from classification successfully',
                data: result,
            },
            201,
        );
    } catch (error: any) {
        const code = extractErrorCode(error);

        if (code === 'P2025') {
            return c.json(
                { error: error?.message ?? 'Subject classification or term not found' },
                404,
            );
        }

        if (code === 'P2002' || code === '23505') {
            return c.json(
                { error: error?.message ?? 'One or more subjects are already offered' },
                409,
            );
        }

        if (code === 'EMPTY_SUBJECT_CLASSIFICATION') {
            return c.json(
                { error: error?.message ?? 'Subject classification has no assigned subjects' },
                400,
            );
        }

        if (code === '23503' || code === '22P02' || code === 'INVALID_SUBJECT_OFFERING_PAYLOAD') {
            return c.json({ error: error?.message ?? 'Invalid subject offering payload' }, 400);
        }

        return respondWithRouteError(
            c,
            error,
            'Create subject offerings from classification error:',
        );
    }
};
