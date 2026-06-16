import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import {
    assertAssessmentAccess,
    resolveAssessmentInstitutionId,
} from '../../../examination/assessment/assessment-access';
import { getQuestionsSchema } from '../question.dto';
import { QuestionService } from '../question.service';

export const getQuestionsRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Questions'],
    summary: 'List question bank questions',
    request: getQuestionsSchema.request,
    responses: {
        200: {
            description: 'Questions fetched successfully',
            content: {
                'application/json': {
                    schema: getQuestionsSchema.response,
                },
            },
        },
    },
});

/**
 * Returns the visible question bank questions for the active user.
 */
export const getQuestionsRouteHandler: AppRouteHandler<typeof getQuestionsRoute> = async (c) => {
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

    const questions = await QuestionService.getQuestions(
        c.get('dbClient'),
        query,
        institutionId,
        user.id,
    );

    return c.json({
        message: 'Questions fetched successfully',
        data: questions,
    });
};
