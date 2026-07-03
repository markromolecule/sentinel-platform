import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { type AppRouteHandler } from '../../../../types/hono';
import { resetExamAttemptLifecycleSchema } from '../lifecycle.dto';
import { resetExamAttempt } from '../services/reset-exam-attempt';

export const resetExamAttemptRoute = createRoute({
    method: 'post',
    path: '/:id/attempts/:attemptId/lifecycle/reset',
    tags: ['Exams'],
    summary: 'Reset one exam attempt',
    request: {
        params: resetExamAttemptLifecycleSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: resetExamAttemptLifecycleSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Exam attempt reset successfully',
            content: {
                'application/json': {
                    schema: resetExamAttemptLifecycleSchema.response,
                },
            },
        },
    },
});

export const resetExamAttemptRouteHandler: AppRouteHandler<typeof resetExamAttemptRoute> = async (
    c,
) => {
    requireActivePermission(c, 'examinations:update');

    const { id, attemptId } = c.req.valid('param');
    const body = c.req.valid('json');
    const result = await resetExamAttempt({
        dbClient: c.get('dbClient'),
        examId: id,
        attemptId,
        reasonCode: body.reasonCode ?? null,
        notes: body.notes ?? null,
        actorUserId: c.get('user')?.id ?? null,
        institutionId: c.get('institutionId'),
    });

    return c.json({
        message: 'Exam attempt reset successfully',
        data: result,
    });
};
