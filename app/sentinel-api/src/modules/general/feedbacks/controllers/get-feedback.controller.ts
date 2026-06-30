import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { requireActivePermission } from '../../../../lib/permissions';
import { type AppRouteHandler } from '../../../../types/hono';
import { FeedbackService } from '../feedback.service';
import { getFeedbackRouteSchema } from '../feedback.dto';

export const getFeedbackRoute = createRoute({
    method: 'get',
    path: '/{id}',
    tags: ['Feedbacks'],
    summary: 'Get feedback by ID',
    description: 'Retrieves a single feedback record under the caller scope.',
    request: {
        params: getFeedbackRouteSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getFeedbackRouteSchema.response,
                },
            },
            description: 'Feedback fetched successfully',
        },
        403: { description: 'Forbidden' },
        404: { description: 'Feedback not found' },
    },
});

export const getFeedbackRouteHandler: AppRouteHandler<typeof getFeedbackRoute> = async (c) => {
    try {
        requireActivePermission(
            c,
            'feedback:view',
            'Forbidden. You do not have permission to view feedback.',
        );

        const { id } = c.req.valid('param');
        const role = c.get('role');
        const institutionId = c.get('institutionId');
        const feedback = await FeedbackService.getFeedback(c.get('dbClient'), {
            feedbackId: id,
            institutionId,
            canViewAllInstitutions: role === 'support' || role === 'superadmin',
        });

        return c.json(
            {
                success: true,
                message: 'Feedback fetched successfully',
                data: feedback,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Get feedback error:');
    }
};
