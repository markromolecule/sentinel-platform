import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { createBulkSectionsSchema } from '../sections.dto';
import { SectionService } from '../sections.service';
import {
    assertSectionMutationAccess,
    buildRequesterAcademicScope,
    resolveSectionPayloadForScope,
} from '../../../_shared/academic-scope';

export const createBulkSectionsRoute = createRoute({
    method: 'post',
    path: '/bulk',
    tags: ['Sections'],
    summary: 'Create multiple sections',
    description: 'Creates multiple new sections in a single request.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createBulkSectionsSchema.body,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                'application/json': {
                    schema: createBulkSectionsSchema.response,
                },
            },
            description: 'Sections created successfully',
        },
        400: { description: 'Bad Request' },
        409: { description: 'Conflict' },
        500: { description: 'Internal Server Error' },
    },
});

export const createBulkSectionsRouteHandler: AppRouteHandler<
    typeof createBulkSectionsRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'sections:create',
            'Forbidden. Missing sections:create permission.',
        );
        const body = c.req.valid('json');
        const user = c.get('user');
        const institutionId = c.get('institutionId');
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const targetInstitutionId =
            role === 'support' ? (body.institution_id ?? institutionId) : institutionId;
        const scope = buildRequesterAcademicScope({
            requesterRole: role,
            requesterInstitutionId: targetInstitutionId,
            requesterDepartmentId: user.user_profiles?.department_id ?? null,
            requesterCourseId: user.user_profiles?.course_id ?? null,
        });

        assertSectionMutationAccess(scope);
        const resolvedScope = await resolveSectionPayloadForScope(c.get('dbClient'), scope, {
            departmentId: body.department_id,
            courseId: body.course_id,
        });

        const rawSections = await SectionService.createBulkSections(c.get('dbClient'), {
            sections: body.sections,
            department_id: resolvedScope.departmentId,
            course_id: resolvedScope.courseId,
            created_by: user.id,
            institutionId: targetInstitutionId,
        });

        const sections = rawSections.map((rawSection) => ({
            section_id: rawSection.section_id,
            section_name: rawSection.section_name,
            department_id: rawSection.department_id,
            course_id: rawSection.course_id,
            year_level: rawSection.year_level,
            created_at: rawSection.created_at,
        }));

        return c.json(
            {
                message: 'Sections created successfully',
                data: sections,
            },
            201,
        );
    } catch (error: any) {
        const code = error?.code ?? error?.cause?.code;
        if (code === 'P2002' || code === '23505') {
            return c.json(
                { error: 'One or more sections already exist for this department and year' },
                409,
            );
        }
        return respondWithRouteError(c, error, 'Create bulk sections error:');
    }
};
