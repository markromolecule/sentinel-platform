import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { deleteSectionSchema } from '../sections.dto';
import { SectionService } from '../sections.service';
import {
    assertSectionMutationAccess,
    assertSectionRecordInScope,
    buildRequesterAcademicScope,
} from '../../../_shared/academic-scope';

export const deleteSectionRoute = createRoute({
    method: 'delete',
    path: '/{id}',
    tags: ['Sections'],
    summary: 'Delete a section',
    description: 'Deletes an existing section.',
    request: {
        params: deleteSectionSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: deleteSectionSchema.response,
                },
            },
            description: 'Section deleted successfully',
        },
        400: { description: 'Bad Request' },
        404: { description: 'Section not found' },
        500: { description: 'Internal Server Error' },
    },
});

export const deleteSectionRouteHandler: AppRouteHandler<typeof deleteSectionRoute> = async (c) => {
    try {
        requireActivePermission(
            c,
            'sections:delete',
            'Forbidden. Missing sections:delete permission.',
        );
        const { id } = c.req.valid('param');
        const user = c.get('user');
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const targetInstitutionId =
            role === 'support'
                ? (c.req.query('institutionId') ?? c.get('institutionId'))
                : c.get('institutionId');
        const scope = buildRequesterAcademicScope({
            requesterRole: role,
            requesterInstitutionId: targetInstitutionId,
            requesterDepartmentId: user.user_profiles?.department_id ?? null,
            requesterCourseId: user.user_profiles?.course_id ?? null,
        });

        assertSectionMutationAccess(scope);
        await assertSectionRecordInScope(c.get('dbClient'), scope, id);

        await SectionService.deleteSection(
            c.get('dbClient'),
            id,
            targetInstitutionId ?? undefined,
            user.id,
        );

        return c.json(
            {
                message: 'Section deleted successfully',
                data: null,
            },
            200,
        );
    } catch (error: any) {
        if (error?.code === 'P2025' || error?.message === 'No result') {
            return c.json({ error: 'Section not found' }, 404);
        }
        return respondWithRouteError(c, error, 'Delete section error:');
    }
};
