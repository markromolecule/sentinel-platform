import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { cancelSubjectRequestSchema } from '../instructor-subject-requests.dto';
import { InstructorSubjectRequestsService } from '../services/instructor-subject-requests.service';

export const cancelSubjectRequestRoute = createRoute({
    method: 'post',
    path: '/:id/cancel',
    tags: ['Instructor Subject Requests'],
    summary: 'Cancel a pending subject request',
    description: 'Allows an instructor to cancel their own pending subject qualification request.',
    request: {
        params: cancelSubjectRequestSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: cancelSubjectRequestSchema.response,
                },
            },
            description: 'Subject request cancelled successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Request not found' },
        500: { description: 'Internal Server Error' },
    },
});

export const cancelSubjectRequestRouteHandler: AppRouteHandler<
    typeof cancelSubjectRequestRoute
> = async (c) => {
    try {
        const user = c.get('user');

        const { id } = c.req.valid('param');

        await InstructorSubjectRequestsService.cancelRequest(c.get('dbClient'), {
            requestId: id,
            instructorUserId: user.id,
        });

        return c.json({
            message: 'Subject request cancelled successfully',
            data: null,
        });
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Cancel subject request error:');
    }
};
