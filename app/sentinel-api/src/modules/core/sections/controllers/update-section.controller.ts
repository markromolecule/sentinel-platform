import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { updateSectionSchema } from '../sections.dto';
import { SectionService } from '../sections.service';
import {
    assertSectionMutationAccess,
    assertSectionRecordInScope,
    buildRequesterAcademicScope,
    resolveSectionPayloadForScope,
} from '../../../_shared/academic-scope';

export const updateSectionRoute = createRoute({
    method: 'put',
    path: '/{id}',
    tags: ['Sections'],
    summary: 'Update a section',
    description: 'Updates an existing section.',
    request: {
        params: updateSectionSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: updateSectionSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: updateSectionSchema.response,
                },
            },
            description: 'Section updated successfully',
        },
        400: { description: 'Bad Request' },
        404: { description: 'Section not found' },
        409: { description: 'Conflict' },
        500: { description: 'Internal Server Error' },
    },
});

export const updateSectionRouteHandler: AppRouteHandler<typeof updateSectionRoute> = async (c) => {
    try {
        requireActivePermission(
            c,
            'sections:update',
            'Forbidden. Missing sections:update permission.',
        );
        const body = c.req.valid('json');
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
        const existingSection = await assertSectionRecordInScope(c.get('dbClient'), scope, id);
        const resolvedScope =
            body.department_id !== undefined || body.course_id !== undefined
                ? await resolveSectionPayloadForScope(c.get('dbClient'), scope, {
                      departmentId: body.department_id,
                      courseId: body.course_id,
                  })
                : {
                      departmentId: existingSection.department_id,
                      courseId: existingSection.course_id,
                  };

        const rawSection = await SectionService.updateSection(c.get('dbClient'), id, {
            name: body.name,
            department_id: resolvedScope.departmentId,
            course_id: resolvedScope.courseId,
            year_level: body.year_level,
            updated_by: user.id,
        });

        const section = {
            section_id: rawSection.section_id,
            section_name: rawSection.section_name,
            department_id: rawSection.department_id,
            course_id: rawSection.course_id,
            year_level: rawSection.year_level,
            created_at: rawSection.created_at,
        };

        return c.json(
            {
                message: 'Section updated successfully',
                data: section,
            },
            200,
        );
    } catch (error: any) {
        const code = error?.code ?? error?.cause?.code;
        if (code === 'P2025' || error?.message === 'No result') {
            return c.json({ error: 'Section not found' }, 404);
        }
        if (code === 'P2002' || code === '23505') {
            return c.json({ error: 'Section name already exists' }, 409);
        }
        return respondWithRouteError(c, error, 'Update section error:');
    }
};
