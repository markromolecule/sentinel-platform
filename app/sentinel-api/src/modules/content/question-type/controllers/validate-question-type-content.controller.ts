import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { assertAssessmentAccess } from '../../../examination/assessment/assessment-access';
import { validateQuestionTypeContentSchema } from '../question-type.dto';
import { QuestionTypeService } from '../question-type.service';

export const validateQuestionTypeContentRoute = createRoute({
    method: 'post',
    path: '/:type/validate',
    tags: ['Question Types'],
    summary: 'Validate question content for a specific question type',
    request: {
        params: validateQuestionTypeContentSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: validateQuestionTypeContentSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Question content validated successfully',
            content: {
                'application/json': {
                    schema: validateQuestionTypeContentSchema.response,
                },
            },
        },
    },
});

export const validateQuestionTypeContentRouteHandler: AppRouteHandler<
    typeof validateQuestionTypeContentRoute
> = async (c) => {
    const { type } = c.req.valid('param');
    const body = c.req.valid('json');
    const supabaseUser = c.get('supabaseUser') as any;

    assertAssessmentAccess(supabaseUser?.user_metadata?.role);

    const result = QuestionTypeService.validateQuestionTypeContent(type, body.content);

    // Telemetry logging
    const user = c.get('user');
    const instId = c.get('institutionId');
    if (user?.id && instId) {
        try {
            const { LogsService } = await import('../../../general/logs/logs.service');
            await LogsService.createLog(c.get('dbClient'), {
                userId: user.id,
                action: 'question_type.validated',
                resourceType: 'question_type',
                resourceId: type,
                activeInstitutionId: instId,
                details: { type },
            });
        } catch (logErr) {
            console.error('Failed to log question_type.validated:', logErr);
        }
    }

    return c.json({
        message: 'Question content validated successfully',
        data: result,
    });
};
