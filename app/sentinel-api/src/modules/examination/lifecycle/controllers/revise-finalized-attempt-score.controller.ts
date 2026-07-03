import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { type AppRouteHandler } from '../../../../types/hono';
import { reviseFinalizedAttemptScoreSchema } from '../lifecycle.dto';
import { reviseFinalizedAttemptScore } from '../services/revise-finalized-attempt-score';

export const reviseFinalizedAttemptScoreRoute = createRoute({
    method: 'post',
    path: '/:id/attempts/:attemptId/lifecycle/revise-finalization',
    tags: ['Exams'],
    summary: 'Mark one finalized exam attempt score for revision',
    request: {
        params: reviseFinalizedAttemptScoreSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: reviseFinalizedAttemptScoreSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Exam attempt score marked for revision successfully',
            content: {
                'application/json': {
                    schema: reviseFinalizedAttemptScoreSchema.response,
                },
            },
        },
    },
});

export const reviseFinalizedAttemptScoreRouteHandler: AppRouteHandler<
    typeof reviseFinalizedAttemptScoreRoute
> = async (c) => {
    requireActivePermission(c, 'examinations:update');

    const { id, attemptId } = c.req.valid('param');
    const body = c.req.valid('json');
    const result = await reviseFinalizedAttemptScore({
        dbClient: c.get('dbClient'),
        examId: id,
        attemptId,
        reasonCode: body.reasonCode,
        notes: body.notes ?? null,
        actorUserId: c.get('user')?.id ?? null,
        institutionId: c.get('institutionId'),
    });

    return c.json({
        message: 'Exam attempt score marked for revision successfully',
        data: result,
    });
};
