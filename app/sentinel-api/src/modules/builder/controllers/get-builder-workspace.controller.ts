import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../types/hono';
import { assertAssessmentAccess } from '../../assessment/assessment-access';
import { getBuilderWorkspaceSchema } from '../builder.dto';
import { BuilderService } from '../builder.service';

export const getBuilderWorkspaceRoute = createRoute({
    method: 'get',
    path: '/exams/:id',
    tags: ['Builder'],
    summary: 'Get builder workspace for an exam',
    request: {
        params: getBuilderWorkspaceSchema.params,
    },
    responses: {
        200: {
            description: 'Builder workspace fetched successfully',
            content: {
                'application/json': {
                    schema: getBuilderWorkspaceSchema.response,
                },
            },
        },
    },
});

export const getBuilderWorkspaceRouteHandler: AppRouteHandler<
    typeof getBuilderWorkspaceRoute
> = async (c) => {
    const { id } = c.req.valid('param');
    const supabaseUser = c.get('supabaseUser') as any;

    assertAssessmentAccess(supabaseUser?.user_metadata?.role);

    const workspace = await BuilderService.getBuilderWorkspace(
        c.get('dbClient'),
        id,
        c.get('institutionId') || undefined,
    );

    return c.json({
        message: 'Builder workspace fetched successfully',
        data: workspace,
    });
};
