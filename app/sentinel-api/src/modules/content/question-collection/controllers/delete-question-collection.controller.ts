import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '@/types/hono';
import { assertAssessmentAccess } from '@/modules/examination/assessment/assessment-access';
import { deleteQuestionCollectionSchema } from '../question-collection.dto';
import { QuestionCollectionService } from '../question-collection.service';

export const deleteQuestionCollectionRoute = createRoute({
    method: 'delete',
    path: '/collections/:id',
    tags: ['Question Collection'],
    summary: 'Delete a question collection',
    request: {
        params: deleteQuestionCollectionSchema.params,
    },
    responses: {
        200: {
            description: 'Collection deleted successfully',
            content: {
                'application/json': {
                    schema: deleteQuestionCollectionSchema.response,
                },
            },
        },
    },
});

export const deleteQuestionCollectionRouteHandler: AppRouteHandler<
    typeof deleteQuestionCollectionRoute
> = async (c) => {
    const { id } = c.req.valid('param');
    const supabaseUser = c.get('supabaseUser') as any;

    assertAssessmentAccess(supabaseUser?.user_metadata?.role);

    await QuestionCollectionService.deleteCollection(
        c.get('dbClient'),
        id,
        c.get('institutionId') || undefined,
    );

    return c.json({
        message: 'Collection deleted successfully',
        data: null,
    });
};
