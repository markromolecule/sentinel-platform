import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { assertAssessmentAccess } from '../../../examination/assessment/assessment-access';
import { getQuestionTypeSchema } from '../question-type.dto';
import { QuestionTypeService } from '../question-type.service';

export const getQuestionTypeRoute = createRoute({
    method: 'get',
    path: '/:type',
    tags: ['Question Types'],
    summary: 'Get a single question type definition',
    request: {
        params: getQuestionTypeSchema.params,
    },
    responses: {
        200: {
            description: 'Question type fetched successfully',
            content: {
                'application/json': {
                    schema: getQuestionTypeSchema.response,
                },
            },
        },
    },
});

export const getQuestionTypeRouteHandler: AppRouteHandler<typeof getQuestionTypeRoute> = async (
    c,
) => {
    const { type } = c.req.valid('param');
    const supabaseUser = c.get('supabaseUser') as any;

    assertAssessmentAccess(supabaseUser?.user_metadata?.role);

    return c.json({
        message: 'Question type fetched successfully',
        data: QuestionTypeService.getQuestionType(type),
    });
};
