import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { requireLifecycleMutationAccess } from '../lifecycle-access';
import { closeExamAttemptLifecycleSchema } from '../lifecycle.dto';
import { closeExamAttempt } from '../services/close-exam-attempt';

export const closeExamAttemptRoute = createRoute({
    method: 'post',
    path: '/:id/attempts/:attemptId/lifecycle/close',
    tags: ['Exams'],
    summary: 'Close one exam attempt',
    request: {
        params: closeExamAttemptLifecycleSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: closeExamAttemptLifecycleSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Exam attempt closed successfully',
            content: {
                'application/json': {
                    schema: closeExamAttemptLifecycleSchema.response,
                },
            },
        },
    },
});

export const closeExamAttemptRouteHandler: AppRouteHandler<typeof closeExamAttemptRoute> = async (
    c,
) => {
    requireLifecycleMutationAccess(c);

    const { id, attemptId } = c.req.valid('param');
    const body = c.req.valid('json');
    const result = await closeExamAttempt({
        dbClient: c.get('dbClient'),
        examId: id,
        attemptId,
        reasonCode: body.reasonCode,
        notes: body.notes ?? null,
        actorUserId: c.get('user')?.id ?? null,
        institutionId: c.get('institutionId'),
    });

    return c.json({
        message: 'Exam attempt closed successfully',
        data: result,
    });
};
