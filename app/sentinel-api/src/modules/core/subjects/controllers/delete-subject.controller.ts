import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { deleteSubjectSchema } from '../subject.dto';
import { SubjectService } from '../subject.service';
import { extractErrorCode } from '../helper/error-utils';
import {
    assertSubjectCatalogWriteAccess,
    buildRequesterAcademicScope,
} from '../../../_shared/academic-scope';

export const deleteSubjectRoute = createRoute({
    method: 'delete',
    path: '/{id}',
    tags: ['Subjects'],
    summary: 'Delete a subject',
    description: 'Deletes an existing subject.',
    request: {
        params: deleteSubjectSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: deleteSubjectSchema.response,
                },
            },
            description: 'Subject deleted successfully',
        },
        404: { description: 'Subject not found' },
        409: { description: 'Subject still has offered subjects' },
        500: { description: 'Internal Server Error' },
    },
});

export const deleteSubjectRouteHandler: AppRouteHandler<typeof deleteSubjectRoute> = async (c) => {
    try {
        const { id } = c.req.valid('param');
        const user = c.get('user');
        const supabaseUser = c.get('supabaseUser') as any;
        const scope = buildRequesterAcademicScope({
            requesterRole: supabaseUser?.user_metadata?.role,
            requesterInstitutionId: c.get('institutionId'),
            requesterDepartmentId: user.user_profiles?.department_id ?? null,
            requesterCourseId: user.user_profiles?.course_id ?? null,
        });

        assertSubjectCatalogWriteAccess(scope);

        await SubjectService.deleteSubject(
            c.get('dbClient'),
            id,
            scope.requesterInstitutionId ?? undefined,
        );

        return c.json(
            {
                message: 'Subject deleted successfully',
                data: null,
            },
            200,
        );
    } catch (error: any) {
        console.error('Delete subject error:', error);
        if (error?.status) {
            return c.json({ error: error.message }, error.status);
        }
        const code = extractErrorCode(error);

        if (error?.code === 'P2025' || error?.message === 'No result') {
            return c.json({ error: 'Subject not found' }, 404);
        }

        if (code === 'SUBJECT_HAS_OFFERINGS') {
            return c.json({ error: error?.message ?? 'Subject still has offered subjects' }, 409);
        }

        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
