import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import {
    assertAssessmentAccess,
    resolveAssessmentInstitutionId,
} from '../../../examination/assessment/assessment-access';
import { getQuestionTypeCountsSchema } from '../question.dto';
import { getQuestionTypeCountsService } from '../services/get-question-type-counts.service';

export const getQuestionTypeCountsRoute = createRoute({
    method: 'get',
    path: '/type-counts',
    tags: ['Questions'],
    summary: 'Get dynamic question type counts',
    request: getQuestionTypeCountsSchema.request,
    responses: {
        200: {
            description: 'Question type counts fetched successfully',
            content: {
                'application/json': {
                    schema: getQuestionTypeCountsSchema.response,
                },
            },
        },
    },
});

/**
 * Controller to fetch dynamic question-type facets matching active non-type filters.
 */
export const getQuestionTypeCountsRouteHandler: AppRouteHandler<
    typeof getQuestionTypeCountsRoute
> = async (c) => {
    const query = c.req.valid('query');
    const user = c.get('user');
    const supabaseUser = c.get('supabaseUser') as any;
    const role = supabaseUser?.user_metadata?.role;

    assertAssessmentAccess(c);

    const institutionId = resolveAssessmentInstitutionId({
        role,
        contextInstitutionId: c.get('institutionId'),
        requestedInstitutionId: query.institutionId,
    });

    const result = await getQuestionTypeCountsService({
        dbClient: c.get('dbClient'),
        filters: query,
        institutionId,
        userId: user.id,
    });

    return c.json({
        message: 'Question type counts fetched successfully',
        data: result,
    });
};
