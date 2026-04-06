import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { assertAssessmentAccess } from '../../assessment/assessment-access';
import { updateExamConfigurationSchema } from '../configuration.dto';
import { ConfigurationService } from '../configuration.service';

export const updateExamConfigurationRoute = createRoute({
    method: 'put',
    path: '/exams/:examId',
    tags: ['Configuration'],
    summary: 'Update exam configuration',
    request: {
        params: updateExamConfigurationSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: updateExamConfigurationSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Exam configuration updated successfully',
            content: {
                'application/json': {
                    schema: updateExamConfigurationSchema.response,
                },
            },
        },
    },
});

export const updateExamConfigurationRouteHandler: AppRouteHandler<
    typeof updateExamConfigurationRoute
> = async (c) => {
    const { examId } = c.req.valid('param');
    const body = c.req.valid('json');
    const supabaseUser = c.get('supabaseUser') as any;

    assertAssessmentAccess(supabaseUser?.user_metadata?.role);

    const configuration = await ConfigurationService.updateExamConfiguration(
        c.get('dbClient'),
        examId,
        body,
        c.get('institutionId') || undefined,
    );

    return c.json({
        message: 'Exam configuration updated successfully',
        data: configuration,
    });
};
