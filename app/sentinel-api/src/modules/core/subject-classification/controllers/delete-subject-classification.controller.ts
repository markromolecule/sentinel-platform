import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { deleteSubjectClassificationSchema } from '../subject-classification.dto';
import { SubjectClassificationService } from '../subject-classification.service';
import {
    assertSubjectCatalogWriteAccess,
    buildRequesterAcademicScope,
} from '../../../_shared/academic-scope';

export const deleteSubjectClassificationRoute = createRoute({
    method: 'delete',
    path: '/{id}',
    tags: ['Subject Classification'],
    summary: 'Delete subject classification',
    description: 'Deletes a subject classification group.',
    request: {
        params: deleteSubjectClassificationSchema.params,
        query: deleteSubjectClassificationSchema.query,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: deleteSubjectClassificationSchema.response,
                },
            },
            description: 'Subject classification deleted successfully',
        },
        404: { description: 'Subject classification not found' },
        500: { description: 'Internal Server Error' },
    },
});

export const deleteSubjectClassificationRouteHandler: AppRouteHandler<
    typeof deleteSubjectClassificationRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'subjects:delete',
            'Forbidden. Missing subjects:delete permission.',
        );
        const { id } = c.req.valid('param');
        const { institutionId: requestedInstitutionId } = c.req.valid('query');
        const user = c.get('user');
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const scope = buildRequesterAcademicScope({
            requesterRole: role,
            requesterInstitutionId:
                role === 'support'
                    ? (requestedInstitutionId ?? c.get('institutionId'))
                    : c.get('institutionId'),
            requesterDepartmentId: user.user_profiles?.department_id ?? null,
            requesterCourseId: user.user_profiles?.course_id ?? null,
        });

        assertSubjectCatalogWriteAccess(scope);

        await SubjectClassificationService.deleteSubjectClassification(
            c.get('dbClient'),
            id,
            scope.requesterInstitutionId ?? undefined,
            user.id,
        );

        return c.json(
            {
                message: 'Subject classification deleted successfully',
                data: null,
            },
            200,
        );
    } catch (error: any) {
        if (
            error?.code === 'P2025' ||
            error?.message === 'No result' ||
            error?.message === 'no result' ||
            error?.name === 'NoResultError'
        ) {
            return c.json({ error: 'Subject classification not found' }, 404);
        }

        return respondWithRouteError(c, error, 'Delete subject classification error:');
    }
};
