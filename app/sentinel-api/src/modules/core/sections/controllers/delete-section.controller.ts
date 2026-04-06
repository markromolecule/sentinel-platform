import { createRoute } from '@hono/zod-openapi';
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
        const { id } = c.req.valid('param');
        const user = c.get('user');
        const supabaseUser = c.get('supabaseUser') as any;
        const scope = buildRequesterAcademicScope({
            requesterRole: supabaseUser?.user_metadata?.role,
            requesterInstitutionId: c.get('institutionId'),
            requesterDepartmentId: user.user_profiles?.department_id ?? null,
            requesterCourseId: user.user_profiles?.course_id ?? null,
        });

        assertSectionMutationAccess(scope);
        await assertSectionRecordInScope(c.get('dbClient'), scope, id);

        await SectionService.deleteSection(c.get('dbClient'), id);

        return c.json(
            {
                message: 'Section deleted successfully',
                data: null,
            },
            200,
        );
    } catch (error: any) {
        console.error('Delete section error:', error);
        if (error?.status) {
            return c.json({ error: error.message }, error.status);
        }
        if (error?.code === 'P2025' || error?.message === 'No result') {
            return c.json({ error: 'Section not found' }, 404);
        }
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
