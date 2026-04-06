import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '@/types/hono';
import {
    assertAssessmentAccess,
    resolveAssessmentInstitutionId,
} from '@/modules/examination/assessment/assessment-access';
import { updateQuestionCollectionSchema } from '../question-collection.dto';
import { QuestionCollectionService } from '../question-collection.service';

export const updateQuestionCollectionRoute = createRoute({
    method: 'put',
    path: '/collections/:id',
    tags: ['Question Collection'],
    summary: 'Update a question collection',
    request: {
        params: updateQuestionCollectionSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: updateQuestionCollectionSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Collection updated successfully',
            content: {
                'application/json': {
                    schema: updateQuestionCollectionSchema.response,
                },
            },
        },
    },
});

export const updateQuestionCollectionRouteHandler: AppRouteHandler<
    typeof updateQuestionCollectionRoute
> = async (c) => {
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');
    const supabaseUser = c.get('supabaseUser') as any;
    const user = c.get('user');
    const role = supabaseUser?.user_metadata?.role;

    assertAssessmentAccess(role);

    const institutionId = resolveAssessmentInstitutionId({
        role,
        contextInstitutionId: c.get('institutionId'),
        requestedInstitutionId: body.institutionId,
    });

    const collection = await QuestionCollectionService.updateCollection(
        c.get('dbClient'),
        id,
        body,
        institutionId,
        user.id,
    );

    return c.json({
        message: 'Collection updated successfully',
        data: collection,
    });
};
