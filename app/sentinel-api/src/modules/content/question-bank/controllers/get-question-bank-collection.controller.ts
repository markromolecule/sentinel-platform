import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { assertAssessmentAccess } from '../../../examination/assessment/assessment-access';
import { getQuestionBankCollectionByIdSchema } from '../question-bank.dto';
import { getQuestionBankCollectionByIdService } from '../services/get-question-bank-collection-by-id.service';

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

export const getQuestionBankCollectionRouteHandler: AppRouteHandler<
    typeof getQuestionBankCollectionRoute
> = async (c) => {
    const { id } = c.req.valid('param');
    const supabaseUser = c.get('supabaseUser') as any;

    assertAssessmentAccess(c);

    const collection = await getQuestionBankCollectionByIdService({
        dbClient: c.get('dbClient'),
        id,
        institutionId: c.get('institutionId') || undefined,
        userId: c.get('user')?.id,
    });

    return c.json({
        message: 'Collection fetched successfully',
        data: collection,
    });
};
