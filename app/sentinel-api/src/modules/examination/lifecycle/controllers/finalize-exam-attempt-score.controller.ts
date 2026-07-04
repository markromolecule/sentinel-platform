import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { requireLifecycleMutationAccess } from '../lifecycle-access';
import { finalizeExamAttemptScoreSchema } from '../lifecycle.dto';
import { finalizeExamAttemptScore } from '../services/finalize-exam-attempt-score';

export const finalizeExamAttemptScoreRoute = createRoute({
    method: 'post',
    path: '/:id/attempts/:attemptId/lifecycle/finalize',
    tags: ['Exams'],
    summary: 'Finalize one exam attempt score',
    request: {
        params: finalizeExamAttemptScoreSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: finalizeExamAttemptScoreSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Exam attempt score finalized successfully',
            content: {
                'application/json': {
                    schema: finalizeExamAttemptScoreSchema.response,
                },
            },
        },
    },
});

export const finalizeExamAttemptScoreRouteHandler: AppRouteHandler<
    typeof finalizeExamAttemptScoreRoute
> = async (c) => {
    requireLifecycleMutationAccess(c);

    const { id, attemptId } = c.req.valid('param');
    const body = c.req.valid('json');
    const result = await finalizeExamAttemptScore({
        dbClient: c.get('dbClient'),
        examId: id,
        attemptId,
        notes: body.notes ?? null,
        actorUserId: c.get('user')?.id ?? null,
        institutionId: c.get('institutionId'),
    });

    return c.json({
        message: 'Exam attempt score finalized successfully',
        data: result,
    });
};
