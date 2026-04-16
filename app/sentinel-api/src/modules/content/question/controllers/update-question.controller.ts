import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import {
    assertAssessmentAccess,
    resolveAssessmentInstitutionId,
} from '../../../examination/assessment/assessment-access';
import { updateQuestionSchema } from '../question.dto';
import { QuestionService } from '../question.service';

export const updateQuestionRoute = createRoute({
    method: 'put',
    path: '/:id',
    tags: ['Questions'],
    summary: 'Update a question bank question',
    request: {
        params: updateQuestionSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: updateQuestionSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Question updated successfully',
            content: {
                'application/json': {
                    schema: updateQuestionSchema.response,
                },
            },
        },
    },
});

export const updateQuestionRouteHandler: AppRouteHandler<typeof updateQuestionRoute> = async (
    c,
) => {
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

    const question = await QuestionService.updateQuestion(
        c.get('dbClient'),
        id,
        body,
        institutionId,
        user.id,
    );

    return c.json({
        message: 'Question updated successfully',
        data: question,
    });
};
