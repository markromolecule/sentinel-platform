import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '@/types/hono';
import {
    assertAssessmentAccess,
    resolveAssessmentInstitutionId,
} from '@/modules/examination/assessment/assessment-access';
import { getQuestionCollectionsSchema } from '../question-collection.dto';
import { QuestionCollectionService } from '../question-collection.service';

export const getQuestionCollectionsRoute = createRoute({
    method: 'get',
    path: '/collections',
    tags: ['Question Collection'],
    summary: 'List question collections',
    request: getQuestionCollectionsSchema.request,
    responses: {
        200: {
            description: 'Collections fetched successfully',
            content: {
                'application/json': {
                    schema: getQuestionCollectionsSchema.response,
                },
            },
        },
    },
});

export const getQuestionCollectionsRouteHandler: AppRouteHandler<
    typeof getQuestionCollectionsRoute
> = async (c) => {
    const query = c.req.valid('query');
    const supabaseUser = c.get('supabaseUser') as any;
    const role = supabaseUser?.user_metadata?.role;

    assertAssessmentAccess(role);

    const institutionId = resolveAssessmentInstitutionId({
        role,
        contextInstitutionId: c.get('institutionId'),
        requestedInstitutionId: query.institutionId,
    });

    const collections = await QuestionCollectionService.getCollections(
        c.get('dbClient'),
        query,
        institutionId,
    );

    return c.json({
        message: 'Collections fetched successfully',
        data: collections,
    });
};
