import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { reviewSubjectRequestSchema } from '../instructor-subject-requests.dto';
import { InstructorSubjectRequestsService } from '../services/instructor-subject-requests.service';
import { requireActivePermission } from '../../../../lib/permissions';

export const reviewSubjectRequestRoute = createRoute({
    method: 'patch',
    path: '/:id/review',
    tags: ['Instructor Subject Requests'],
    summary: 'Review an instructor subject qualification request',
    description: 'Allows an administrator to approve, reject, or waitlist an instructor subject request.',
    request: {
        params: reviewSubjectRequestSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: reviewSubjectRequestSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: reviewSubjectRequestSchema.response,
                },
            },
            description: 'Subject request reviewed successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Subject request not found' },
        500: { description: 'Internal Server Error' },
    },
});

export const reviewSubjectRequestRouteHandler: AppRouteHandler<
    typeof reviewSubjectRequestRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'subjects:update',
            'Forbidden. You do not have permission to review subject requests.',
        );

        const institutionId = c.get('institutionId');
        const user = c.get('user');

        if (!institutionId) {
            return c.json({ error: 'Unauthorized. Institution ID not found.' }, 401 as any);
        }

        const { id } = c.req.valid('param');
        const payload = c.req.valid('json');

        const request = await InstructorSubjectRequestsService.reviewRequest(c.get('dbClient'), {
            requestId: id,
            status: payload.status,
            reviewerUserId: user.id,
            reviewComments: payload.reviewComments,
            institutionId,
        });

        return c.json({
            message: `Subject request ${payload.status.toLowerCase()} successfully`,
            data: request as any,
        });
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Review subject request error:');
    }
};
