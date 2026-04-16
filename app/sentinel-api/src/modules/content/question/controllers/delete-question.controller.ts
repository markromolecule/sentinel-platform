import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { assertAssessmentAccess } from '../../../examination/assessment/assessment-access';
import { deleteQuestionSchema } from '../question.dto';
import { QuestionService } from '../question.service';

export const deleteQuestionRoute = createRoute({
    method: 'delete',
    path: '/:id',
    tags: ['Questions'],
    summary: 'Archive a question bank question',
    request: {
        params: deleteQuestionSchema.params,
    },
    responses: {
        200: {
            description: 'Question deleted successfully',
            content: {
                'application/json': {
                    schema: deleteQuestionSchema.response,
                },
            },
        },
    },
});

export const deleteQuestionRouteHandler: AppRouteHandler<typeof deleteQuestionRoute> = async (
    c,
) => {
    const { id } = c.req.valid('param');
    const supabaseUser = c.get('supabaseUser') as any;

    assertAssessmentAccess(supabaseUser?.user_metadata?.role);

    await QuestionService.deleteQuestion(
        c.get('dbClient'),
        id,
        c.get('institutionId') || undefined,
    );

    return c.json({
        message: 'Question deleted successfully',
        data: null,
    });
};
