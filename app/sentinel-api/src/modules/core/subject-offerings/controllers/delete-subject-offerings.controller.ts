import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { deleteSubjectOfferingsSchema } from '../subject-offerings.dto';
import { SubjectOfferingsService } from '../subject-offerings.service';
import {
    assertSubjectOfferingRecordInScope,
    assertSubjectOfferingMutationAccess,
    buildRequesterAcademicScope,
} from '../../../_shared/academic-scope';

export const deleteSubjectOfferingsRoute = createRoute({
    method: 'post',
    path: '/bulk-delete',
    tags: ['Subject Offerings'],
    summary: 'Bulk delete subject offerings',
    description: 'Deletes multiple subject offerings.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: deleteSubjectOfferingsSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: deleteSubjectOfferingsSchema.response,
                },
            },
            description: 'Subject offerings deleted successfully',
        },
        500: { description: 'Internal Server Error' },
    },
});

export const deleteSubjectOfferingsRouteHandler: AppRouteHandler<
    typeof deleteSubjectOfferingsRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'subject_offerings:delete',
            'Forbidden. Missing subject_offerings:delete permission.',
        );
        const { ids } = c.req.valid('json');
        const user = c.get('user');
        const supabaseUser = c.get('supabaseUser') as any;
        const scope = buildRequesterAcademicScope({
            requesterRole: supabaseUser?.user_metadata?.role,
            requesterInstitutionId: c.get('institutionId'),
            requesterDepartmentId: user.user_profiles?.department_id ?? null,
            requesterCourseId: user.user_profiles?.course_id ?? null,
        });

        assertSubjectOfferingMutationAccess(scope);

        // Verify all exist and are in scope before deleting
        for (const id of ids) {
            const existingOffering = await SubjectOfferingsService.getSubjectOfferingById(
                c.get('dbClient'),
                id,
                c.get('institutionId'),
            );
            assertSubjectOfferingRecordInScope(scope, {
                departmentIds: existingOffering.department_ids,
                courseIds: existingOffering.course_ids,
            });
        }

        await SubjectOfferingsService.deleteSubjectOfferings(
            c.get('dbClient'),
            ids,
            c.get('institutionId'),
        );

        return c.json(
            {
                message: 'Subject offerings deleted successfully',
                data: null,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Bulk delete subject offerings error:');
    }
};
