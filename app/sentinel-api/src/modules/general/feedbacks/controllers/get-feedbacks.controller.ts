import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { requireActivePermission } from '../../../../lib/permissions';
import { type AppRouteHandler } from '../../../../types/hono';
import { FeedbackService } from '../feedback.service';
import { getFeedbacksRouteSchema } from '../feedback.dto';

export const getFeedbacksRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Feedbacks'],
    summary: 'List feedback records',
    description: 'Retrieves paginated student feedback records for support review.',
    request: getFeedbacksRouteSchema.request,
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getFeedbacksRouteSchema.response,
                },
            },
            description: 'Feedback records fetched successfully',
        },
        403: { description: 'Forbidden' },
    },
});

export const getFeedbacksRouteHandler: AppRouteHandler<typeof getFeedbacksRoute> = async (c) => {
    try {
        requireActivePermission(
            c,
            'feedback:view',
            'Forbidden. You do not have permission to view feedback.',
        );

        const query = c.req.valid('query');
        const role = c.get('role');
        const institutionId = c.get('institutionId');
        const data = await FeedbackService.getFeedbacks(c.get('dbClient'), {
            ...query,
            institutionId,
            canViewAllInstitutions: role === 'support' || role === 'superadmin',
        });

        return c.json(
            {
                success: true,
                message: 'Feedback records fetched successfully',
                data,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Get feedbacks error:');
    }
};
