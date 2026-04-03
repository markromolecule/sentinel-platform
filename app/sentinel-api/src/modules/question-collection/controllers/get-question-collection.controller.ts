import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../types/hono';
import { assertAssessmentAccess } from '../../assessment/assessment-access';
import { getQuestionCollectionByIdSchema } from '../question-collection.dto';
import { QuestionCollectionService } from '../question-collection.service';

export const getQuestionCollectionRoute = createRoute({
    method: 'get',
    path: '/collections/:id',
    tags: ['Question Collection'],
    summary: 'Get a question collection by id',
    request: {
        params: getQuestionCollectionByIdSchema.params,
    },
    responses: {
        200: {
            description: 'Collection fetched successfully',
            content: {
                'application/json': {
                    schema: getQuestionCollectionByIdSchema.response,
                },
            },
        },
    },
});

export const getQuestionCollectionRouteHandler: AppRouteHandler<
    typeof getQuestionCollectionRoute
> = async (c) => {
    const { id } = c.req.valid('param');
    const supabaseUser = c.get('supabaseUser') as any;

    assertAssessmentAccess(supabaseUser?.user_metadata?.role);

    const collection = await QuestionCollectionService.getCollectionById(
        c.get('dbClient'),
        id,
        c.get('institutionId') || undefined,
    );

    return c.json({
        message: 'Collection fetched successfully',
        data: collection,
    });
};
