import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { FeedbackService } from '../feedback.service';
import { createFeedbackRouteSchema } from '../feedback.dto';
import { HTTPException } from 'hono/http-exception';
import { requireActivePermission } from '../../../../lib/permissions';

export const createFeedbackRoute = createRoute({
    method: 'post',
    path: '/',
    tags: ['Feedbacks'],
    summary: 'Create exam feedback',
    description: 'Creates a single feedback record for a completed student exam attempt.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createFeedbackRouteSchema.body,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                'application/json': {
                    schema: createFeedbackRouteSchema.response,
                },
            },
            description: 'Feedback created successfully',
        },
        403: { description: 'Forbidden' },
        404: { description: 'Completed attempt not found' },
        409: { description: 'Feedback already exists for this attempt' },
    },
});

export const createFeedbackRouteHandler: AppRouteHandler<typeof createFeedbackRoute> = async (c) => {
    try {
        requireActivePermission(
            c,
            'feedback:create',
            'Forbidden. You do not have permission to submit feedback.',
        );

        const user = c.get('user');

        if (!user?.id) {
            throw new HTTPException(403, {
                message: 'Forbidden. Only students can submit feedback.',
            });
        }

        const payload = c.req.valid('json');
        const feedback = await FeedbackService.createFeedback(c.get('dbClient'), {
            userId: user.id,
            payload,
        });

        return c.json(
            {
                success: true,
                message: 'Feedback created successfully',
                data: feedback,
            },
            201,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Create feedback error:');
    }
};
