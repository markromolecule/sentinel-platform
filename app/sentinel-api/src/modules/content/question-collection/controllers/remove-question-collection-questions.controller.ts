import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { assertAssessmentAccess } from '../../../examination/assessment/assessment-access';
import { mutateQuestionCollectionQuestionsSchema } from '../question-collection.dto';
import { QuestionCollectionService } from '../question-collection.service';

export const removeQuestionCollectionQuestionsRoute = createRoute({
    method: 'delete',
    path: '/collections/:id/questions',
    tags: ['Question Collection'],
    summary: 'Remove questions from a collection',
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

export const removeQuestionCollectionQuestionsRouteHandler: AppRouteHandler<
    typeof removeQuestionCollectionQuestionsRoute
> = async (c) => {
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');
    const supabaseUser = c.get('supabaseUser') as any;

    assertAssessmentAccess(supabaseUser?.user_metadata?.role);

    const collection = await QuestionCollectionService.removeQuestionsFromCollection(
        c.get('dbClient'),
        id,
        body.questionIds,
        c.get('user').id,
        c.get('institutionId') || undefined,
    );

    return c.json({
        message: 'Questions removed from collection successfully',
        data: collection,
    });
};
