import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../types/hono';
import { assertAssessmentAccess } from '../../assessment/assessment-access';
import { mutateQuestionBankCollectionQuestionsSchema } from '../question-bank.dto';
import { QuestionBankService } from '../question-bank.service';

export const removeQuestionBankCollectionQuestionsRoute = createRoute({
    method: 'delete',
    path: '/collections/:id/questions',
    tags: ['Question Bank'],
    summary: 'Remove questions from a collection',
    request: {
        params: mutateQuestionBankCollectionQuestionsSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: mutateQuestionBankCollectionQuestionsSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Collection questions updated successfully',
            content: {
                'application/json': {
                    schema: mutateQuestionBankCollectionQuestionsSchema.response,
                },
            },
        },
    },
});

export const removeQuestionBankCollectionQuestionsRouteHandler: AppRouteHandler<typeof removeQuestionBankCollectionQuestionsRoute> = async (c) => {
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');
    const supabaseUser = c.get('supabaseUser') as any;

    assertAssessmentAccess(supabaseUser?.user_metadata?.role);

    const collection = await QuestionBankService.removeQuestionsFromCollection(
        c.get('dbClient'),
        id,
        body.questionIds,
        c.get('institutionId') || undefined,
    );

    return c.json({
        message: 'Questions removed from collection successfully',
        data: collection,
    });
};
