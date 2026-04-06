import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import {
    assertAssessmentAccess,
    resolveAssessmentInstitutionId,
} from '../../assessment/assessment-access';
import { saveBuilderWorkspaceSchema } from '../builder.dto';
import { BuilderService } from '../builder.service';

export const saveBuilderWorkspaceRoute = createRoute({
    method: 'put',
    path: '/exams/:id',
    tags: ['Builder'],
    summary: 'Save builder workspace for an exam',
    request: {
        params: saveBuilderWorkspaceSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: saveBuilderWorkspaceSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Builder workspace saved successfully',
            content: {
                'application/json': {
                    schema: saveBuilderWorkspaceSchema.response,
                },
            },
        },
    },
});

export const saveBuilderWorkspaceRouteHandler: AppRouteHandler<
    typeof saveBuilderWorkspaceRoute
> = async (c) => {
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');
    const supabaseUser = c.get('supabaseUser') as any;
    const user = c.get('user');
    const role = supabaseUser?.user_metadata?.role;

    assertAssessmentAccess(role);

    const institutionId = resolveAssessmentInstitutionId({
        role,
        contextInstitutionId: c.get('institutionId'),
        requestedInstitutionId: body.institutionId,
    });

    const workspace = await BuilderService.saveBuilderWorkspace(
        c.get('dbClient'),
        id,
        body,
        institutionId,
        user.id,
    );

    return c.json({
        message: 'Builder workspace saved successfully',
        data: workspace,
    });
};
