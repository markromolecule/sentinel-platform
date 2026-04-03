import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../types/hono';
import { assertAssessmentAccess } from '../../assessment/assessment-access';
import { validateQuestionTypeContentSchema } from '../question-type.dto';
import { QuestionTypeService } from '../question-type.service';

export const validateQuestionTypeContentRoute = createRoute({
    method: 'post',
    path: '/:type/validate',
    tags: ['Question Types'],
    summary: 'Validate question content for a specific question type',
    request: {
        params: validateQuestionTypeContentSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: validateQuestionTypeContentSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Question content validated successfully',
            content: {
                'application/json': {
                    schema: validateQuestionTypeContentSchema.response,
                },
            },
        },
    },
});

export const validateQuestionTypeContentRouteHandler: AppRouteHandler<
    typeof validateQuestionTypeContentRoute
> = async (c) => {
    const { type } = c.req.valid('param');
    const body = c.req.valid('json');
    const supabaseUser = c.get('supabaseUser') as any;

    assertAssessmentAccess(supabaseUser?.user_metadata?.role);

    return c.json({
        message: 'Question content validated successfully',
        data: QuestionTypeService.validateQuestionTypeContent(type, body.content),
    });
};
