import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { type AppRouteHandler } from '../../../../types/hono';
import { reopenExamAttemptLifecycleSchema } from '../lifecycle.dto';
import { reopenExamAttempt } from '../services/reopen-exam-attempt';

export const reopenExamAttemptRoute = createRoute({
    method: 'post',
    path: '/:id/attempts/:attemptId/lifecycle/reopen',
    tags: ['Exams'],
    summary: 'Reopen one exam attempt',
    request: {
        params: reopenExamAttemptLifecycleSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: reopenExamAttemptLifecycleSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Exam attempt reopened successfully',
            content: {
                'application/json': {
                    schema: reopenExamAttemptLifecycleSchema.response,
                },
            },
        },
    },
});

export const reopenExamAttemptRouteHandler: AppRouteHandler<typeof reopenExamAttemptRoute> = async (
    c,
) => {
    requireActivePermission(c, 'examinations:update');

    const { id, attemptId } = c.req.valid('param');
    const body = c.req.valid('json');
    const result = await reopenExamAttempt({
        dbClient: c.get('dbClient'),
        examId: id,
        attemptId,
        reopenedUntil: body.reopenedUntil,
        reasonCode: body.reasonCode ?? null,
        notes: body.notes ?? null,
        actorUserId: c.get('user')?.id ?? null,
        institutionId: c.get('institutionId'),
    });

    return c.json({
        message: 'Exam attempt reopened successfully',
        data: result,
    });
};
