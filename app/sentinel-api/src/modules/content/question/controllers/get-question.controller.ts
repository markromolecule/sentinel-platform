import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { assertAssessmentAccess } from '../../../examination/assessment/assessment-access';
import { getQuestionByIdSchema } from '../question.dto';
import { QuestionService } from '../question.service';

export const getQuestionRoute = createRoute({
    method: 'get',
    path: '/:id',
    tags: ['Questions'],
    summary: 'Get a question bank question',
    request: {
        params: getQuestionByIdSchema.params,
    },
    responses: {
        200: {
            description: 'Question fetched successfully',
            content: {
                'application/json': {
                    schema: getQuestionByIdSchema.response,
                },
            },
        },
    },
});

export const getQuestionRouteHandler: AppRouteHandler<typeof getQuestionRoute> = async (c) => {
    const { id } = c.req.valid('param');
    const supabaseUser = c.get('supabaseUser') as any;

    assertAssessmentAccess(supabaseUser?.user_metadata?.role);

    const question = await QuestionService.getQuestionById(
        c.get('dbClient'),
        id,
        c.get('institutionId') || undefined,
    );

    return c.json({
        message: 'Question fetched successfully',
        data: question,
    });
};
