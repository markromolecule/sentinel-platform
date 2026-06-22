import { createRoute } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { type AppRouteHandler } from '../../../../types/hono';
import { assertAssessmentAccess } from '../../../examination/assessment/assessment-access';
import { mutateQuestionBankCollectionQuestionsSchema } from '../question-bank.dto';
import { removeQuestionsFromCollectionService } from '../services/remove-question-bank-collection-questions.service';

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

export const removeQuestionBankCollectionQuestionsRouteHandler: AppRouteHandler<
    typeof removeQuestionBankCollectionQuestionsRoute
> = async (c) => {
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');
    const user = c.get('user');

    assertAssessmentAccess(c);

    if (!body.questionIds?.length) {
        throw new HTTPException(400, {
            message: 'Provide at least one question id to remove.',
        });
    }

    const collection = await removeQuestionsFromCollectionService({
        dbClient: c.get('dbClient'),
        id,
        questionIds: body.questionIds,
        userId: user.id,
        institutionId: c.get('institutionId') || undefined,
    });

    return c.json({
        message: 'Questions removed from collection successfully',
        data: collection,
    });
};
