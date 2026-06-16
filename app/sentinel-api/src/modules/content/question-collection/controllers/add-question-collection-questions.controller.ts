import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { assertAssessmentAccess } from '../../../examination/assessment/assessment-access';
import { mutateQuestionCollectionQuestionsSchema } from '../question-collection.dto';
import { QuestionCollectionService } from '../question-collection.service';

export const addQuestionCollectionQuestionsRoute = createRoute({
    method: 'post',
    path: '/collections/:id/questions',
    tags: ['Question Collection'],
    summary: 'Add existing questions to a collection',
    request: {
        params: mutateQuestionCollectionQuestionsSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: mutateQuestionCollectionQuestionsSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Collection questions updated successfully',
            content: {
                'application/json': {
                    schema: mutateQuestionCollectionQuestionsSchema.response,
                },
            },
        },
    },
});

export const addQuestionCollectionQuestionsRouteHandler: AppRouteHandler<
    typeof addQuestionCollectionQuestionsRoute
> = async (c) => {
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');
    const supabaseUser = c.get('supabaseUser') as any;

    assertAssessmentAccess(supabaseUser?.user_metadata?.role);

    const collection = await QuestionCollectionService.addQuestionsToCollection(
        c.get('dbClient'),
        id,
        body.questionIds,
        c.get('user').id,
        c.get('institutionId') || undefined,
    );

    return c.json({
        message: 'Questions added to collection successfully',
        data: collection,
    });
};
