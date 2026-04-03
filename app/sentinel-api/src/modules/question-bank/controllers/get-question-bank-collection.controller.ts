import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../types/hono';
import { assertAssessmentAccess } from '../../assessment/assessment-access';
import { getQuestionBankCollectionByIdSchema } from '../question-bank.dto';
import { QuestionBankService } from '../question-bank.service';

export const getQuestionBankCollectionRoute = createRoute({
    method: 'get',
    path: '/collections/:id',
    tags: ['Question Bank'],
    summary: 'Get a question bank collection',
    request: {
        params: getQuestionBankCollectionByIdSchema.params,
    },
    responses: {
        200: {
            description: 'Collection fetched successfully',
            content: {
                'application/json': {
                    schema: getQuestionBankCollectionByIdSchema.response,
                },
            },
        },
    },
});

export const getQuestionBankCollectionRouteHandler: AppRouteHandler<typeof getQuestionBankCollectionRoute> = async (c) => {
    const { id } = c.req.valid('param');
    const supabaseUser = c.get('supabaseUser') as any;

    assertAssessmentAccess(supabaseUser?.user_metadata?.role);

    const collection = await QuestionBankService.getCollectionById(
        c.get('dbClient'),
        id,
        c.get('institutionId') || undefined,
    );

    return c.json({
        message: 'Collection fetched successfully',
        data: collection,
    });
};
