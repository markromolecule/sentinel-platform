import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../types/hono';
import { assertAssessmentAccess } from '../../_shared/assessment-access';
import { mutateQuestionBankCollectionQuestionsSchema } from '../question-bank.dto';
import { QuestionBankService } from '../question-bank.service';

export const addQuestionBankCollectionQuestionsRoute = createRoute({
    method: 'post',
    path: '/collections/:id/questions',
    tags: ['Question Bank'],
    summary: 'Add existing questions to a collection',
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

export const addQuestionBankCollectionQuestionsRouteHandler: AppRouteHandler<typeof addQuestionBankCollectionQuestionsRoute> = async (c) => {
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');
    const supabaseUser = c.get('supabaseUser') as any;

    assertAssessmentAccess(supabaseUser?.user_metadata?.role);

    const collection = await QuestionBankService.addQuestionsToCollection(
        c.get('dbClient'),
        id,
        body.questionIds,
        c.get('institutionId') || undefined,
    );

    return c.json({
        message: 'Questions added to collection successfully',
        data: collection,
    });
};
