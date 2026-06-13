import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { assertAssessmentAccess } from '../../../examination/assessment/assessment-access';
import { deleteQuestionBankCollectionSchema } from '../question-bank.dto';
import { QuestionBankService } from '../question-bank.service';

export const deleteQuestionBankCollectionRoute = createRoute({
    method: 'delete',
    path: '/collections/:id',
    tags: ['Question Bank'],
    summary: 'Delete a question bank collection',
    request: {
        params: deleteQuestionBankCollectionSchema.params,
    },
    responses: {
        200: {
            description: 'Collection deleted successfully',
            content: {
                'application/json': {
                    schema: deleteQuestionBankCollectionSchema.response,
                },
            },
        },
    },
});

export const deleteQuestionBankCollectionRouteHandler: AppRouteHandler<
    typeof deleteQuestionBankCollectionRoute
> = async (c) => {
    const { id } = c.req.valid('param');
    const supabaseUser = c.get('supabaseUser') as any;

    assertAssessmentAccess(c);

    await QuestionBankService.deleteCollection(
        c.get('dbClient'),
        id,
        c.get('institutionId') || undefined,
    );

    return c.json({
        message: 'Collection deleted successfully',
        data: null,
    });
};
