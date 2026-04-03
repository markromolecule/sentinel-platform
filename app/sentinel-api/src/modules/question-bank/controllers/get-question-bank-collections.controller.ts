import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../types/hono';
import {
    assertAssessmentAccess,
    resolveAssessmentInstitutionId,
} from '../../assessment/assessment-access';
import { getQuestionBankCollectionsSchema } from '../question-bank.dto';
import { QuestionBankService } from '../question-bank.service';

export const getQuestionBankCollectionsRoute = createRoute({
    method: 'get',
    path: '/collections',
    tags: ['Question Bank'],
    summary: 'List question bank collections',
    request: getQuestionBankCollectionsSchema.request,
    responses: {
        200: {
            description: 'Collections fetched successfully',
            content: {
                'application/json': {
                    schema: getQuestionBankCollectionsSchema.response,
                },
            },
        },
    },
});

export const getQuestionBankCollectionsRouteHandler: AppRouteHandler<typeof getQuestionBankCollectionsRoute> = async (c) => {
    const query = c.req.valid('query');
    const supabaseUser = c.get('supabaseUser') as any;
    const role = supabaseUser?.user_metadata?.role;

    assertAssessmentAccess(role);

    const institutionId = resolveAssessmentInstitutionId({
        role,
        contextInstitutionId: c.get('institutionId'),
        requestedInstitutionId: query.institutionId,
    });

    const collections = await QuestionBankService.getCollections(
        c.get('dbClient'),
        query,
        institutionId,
    );

    return c.json({
        message: 'Collections fetched successfully',
        data: collections,
    });
};
