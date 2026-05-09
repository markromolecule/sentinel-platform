import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { deleteSelectedSubjectsSchema } from '../subject.dto';
import { SubjectService } from '../subject.service';
import { extractErrorCode } from '../helper/error-utils';
import {
    assertSubjectCatalogWriteAccess,
    buildRequesterAcademicScope,
} from '../../../_shared/academic-scope';

export const deleteSelectedSubjectsRoute = createRoute({
    method: 'delete',
    path: '/bulk',
    tags: ['Subjects'],
    summary: 'Delete selected subjects',
    description:
        'Deletes selected subjects from the master catalog when none of them have active offered subjects.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: deleteSelectedSubjectsSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: deleteSelectedSubjectsSchema.response,
                },
            },
            description: 'Subjects deleted successfully',
        },
        409: { description: 'One or more selected subjects still have offered subjects' },
        500: { description: 'Internal Server Error' },
    },
});

export const deleteSelectedSubjectsRouteHandler: AppRouteHandler<
    typeof deleteSelectedSubjectsRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'subjects:delete',
            'Forbidden. Missing subjects:delete permission.',
        );
        const body = c.req.valid('json');
        const user = c.get('user');
        const supabaseUser = c.get('supabaseUser') as any;
        const scope = buildRequesterAcademicScope({
            requesterRole: supabaseUser?.user_metadata?.role,
            requesterInstitutionId: c.get('institutionId'),
            requesterDepartmentId: user.user_profiles?.department_id ?? null,
            requesterCourseId: user.user_profiles?.course_id ?? null,
        });

        assertSubjectCatalogWriteAccess(scope);
        const result = await SubjectService.deleteSelectedSubjects(
            c.get('dbClient'),
            body.subject_ids,
            scope.requesterInstitutionId ?? undefined,
            user.id,
        );

        return c.json(
            {
                message: 'Subjects deleted successfully',
                data: result,
            },
            200,
        );
    } catch (error: any) {
        const code = extractErrorCode(error);

        if (code === 'SUBJECT_HAS_OFFERINGS') {
            return c.json(
                { error: error?.message ?? 'Selected subjects still have offered subjects' },
                409,
            );
        }

        return respondWithRouteError(c, error, 'Delete selected subjects error:');
    }
};
