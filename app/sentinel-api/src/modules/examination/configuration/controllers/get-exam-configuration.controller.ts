import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '@/types/hono';
import { assertAssessmentAccess } from '@/modules/examination/assessment/assessment-access';
import { getExamConfigurationSchema } from '../configuration.dto';
import { ConfigurationService } from '../configuration.service';

export const getExamConfigurationRoute = createRoute({
    method: 'get',
    path: '/exams/:examId',
    tags: ['Configuration'],
    summary: 'Get exam configuration',
    request: {
        params: getExamConfigurationSchema.params,
    },
    responses: {
        200: {
            description: 'Exam configuration fetched successfully',
            content: {
                'application/json': {
                    schema: getExamConfigurationSchema.response,
                },
            },
        },
    },
});

export const getExamConfigurationRouteHandler: AppRouteHandler<
    typeof getExamConfigurationRoute
> = async (c) => {
    const { examId } = c.req.valid('param');
    const supabaseUser = c.get('supabaseUser') as any;

    assertAssessmentAccess(supabaseUser?.user_metadata?.role);

    const configuration = await ConfigurationService.getExamConfiguration(
        c.get('dbClient'),
        examId,
        c.get('institutionId') || undefined,
    );

    return c.json({
        message: 'Exam configuration fetched successfully',
        data: configuration,
    });
};
