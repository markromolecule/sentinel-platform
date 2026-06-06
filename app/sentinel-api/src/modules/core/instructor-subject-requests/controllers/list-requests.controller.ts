import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { listSubjectRequestsSchema } from '../instructor-subject-requests.dto';
import { InstructorSubjectRequestsService } from '../instructor-subject-requests.service';

export const listSubjectRequestsRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Instructor Subject Requests'],
    summary: 'List subject qualification requests',
    description:
        'Lists subject requests. Instructors see only their own, while admins see all within the institution.',
    request: {
        query: listSubjectRequestsSchema.request.query,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: listSubjectRequestsSchema.response,
                },
            },
            description: 'Subject requests retrieved successfully',
        },
        401: { description: 'Unauthorized' },
        500: { description: 'Internal Server Error' },
    },
});

export const listSubjectRequestsRouteHandler: AppRouteHandler<
    typeof listSubjectRequestsRoute
> = async (c) => {
    try {
        const institutionId = c.get('institutionId');
        const user = c.get('user');
        const permissions = c.get('activePermissionKeys') || [];

        if (!institutionId) {
            return c.json({ error: 'Unauthorized. Institution ID not found.' }, 401 as any);
        }

        const query = c.req.valid('query');

        // RBAC Check: If caller does not have 'subjects:update', restrict to their own user ID.
        const canReview = permissions.includes('subjects:update');
        const instructorUserId = canReview ? undefined : user.id;

        const requests = await InstructorSubjectRequestsService.listRequests(c.get('dbClient'), {
            instructorUserId,
            status: query.status,
            institutionId,
        });

        return c.json({
            message: 'Subject requests retrieved successfully',
            data: requests as any,
        });
    } catch (error: any) {
        return respondWithRouteError(c, error, 'List subject requests error:');
    }
};
