import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import {
    assertAssessmentAccess,
    resolveAssessmentInstitutionId,
} from '../../../examination/assessment/assessment-access';
import { createQuestionSchema } from '../question.dto';
import { QuestionService } from '../question.service';

export const createQuestionRoute = createRoute({
    method: 'post',
    path: '/',
    tags: ['Questions'],
    summary: 'Create a question bank question',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createQuestionSchema.body,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Question created successfully',
            content: {
                'application/json': {
                    schema: createQuestionSchema.response,
                },
            },
        },
    },
});

export const createQuestionRouteHandler: AppRouteHandler<typeof createQuestionRoute> = async (c) => {
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

    const question = await QuestionService.createQuestion(
        c.get('dbClient'),
        body,
        institutionId,
        user.id,
    );

    return c.json(
        {
            message: 'Question created successfully',
            data: question,
        },
        201,
    );
};
