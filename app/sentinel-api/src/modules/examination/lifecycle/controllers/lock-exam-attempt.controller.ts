import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { requireLifecycleMutationAccess } from '../lifecycle-access';
import { lockExamAttemptLifecycleSchema } from '../lifecycle.dto';
import { lockExamAttempt } from '../services/lock-exam-attempt';

export const lockExamAttemptRoute = createRoute({
    method: 'post',
    path: '/:id/attempts/:attemptId/lifecycle/lock',
    tags: ['Exams'],
    summary: 'Lock one exam attempt',
    request: {
        params: lockExamAttemptLifecycleSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: lockExamAttemptLifecycleSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Exam attempt locked successfully',
            content: {
                'application/json': {
                    schema: lockExamAttemptLifecycleSchema.response,
                },
            },
        },
    },
});

export const lockExamAttemptRouteHandler: AppRouteHandler<typeof lockExamAttemptRoute> = async (
    c,
) => {
    requireLifecycleMutationAccess(c);

    const { id, attemptId } = c.req.valid('param');
    const body = c.req.valid('json');
    const result = await lockExamAttempt({
        dbClient: c.get('dbClient'),
        examId: id,
        attemptId,
        reasonCode: body.reasonCode,
        notes: body.notes ?? null,
        actorUserId: c.get('user')?.id ?? null,
        institutionId: c.get('institutionId'),
    });

    return c.json({
        message: 'Exam attempt locked successfully',
        data: result,
    });
};
