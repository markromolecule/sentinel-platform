import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { assertAssessmentAccess } from '../../assessment/assessment-access';
import { publishBuilderWorkspaceSchema } from '../builder.dto';
import { BuilderService } from '../builder.service';

export const publishBuilderWorkspaceRoute = createRoute({
    method: 'post',
    path: '/exams/:id/publish',
    tags: ['Builder'],
    summary: 'Publish an exam from the builder workspace',
    request: {
        params: publishBuilderWorkspaceSchema.params,
    },
    responses: {
        200: {
            description: 'Builder workspace published successfully',
            content: {
                'application/json': {
                    schema: publishBuilderWorkspaceSchema.response,
                },
            },
        },
    },
});

export const publishBuilderWorkspaceRouteHandler: AppRouteHandler<
    typeof publishBuilderWorkspaceRoute
> = async (c) => {
    const { id } = c.req.valid('param');
    const supabaseUser = c.get('supabaseUser') as any;
    const user = c.get('user');

    assertAssessmentAccess(supabaseUser?.user_metadata?.role);

    const workspace = await BuilderService.publishBuilderWorkspace(
        c.get('dbClient'),
        id,
        c.get('institutionId') || undefined,
        user.id,
    );

    return c.json({
        message: 'Builder workspace published successfully',
        data: workspace,
    });
};
