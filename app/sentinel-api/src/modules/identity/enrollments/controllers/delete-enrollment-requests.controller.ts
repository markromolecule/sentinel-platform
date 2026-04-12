import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { deleteEnrollmentRequestsSchema } from '../enrollments.dto';
import { EnrollmentService } from '../enrollments.service';

export const deleteEnrollmentRequestsRoute = createRoute({
    method: 'delete',
    path: '/requests/bulk',
    tags: ['Subjects', 'Admin'],
    summary: 'Delete enrollment requests',
    description:
        'Deletes selected instructor enrollment requests and removes instructor class assignments for any approved requests in the selection.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: deleteEnrollmentRequestsSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: deleteEnrollmentRequestsSchema.response,
                },
            },
            description: 'Requests deleted successfully',
        },
        403: { description: 'Forbidden' },
        404: { description: 'Not Found' },
        500: { description: 'Internal Server Error' },
    },
});

export const deleteEnrollmentRequestsRouteHandler: AppRouteHandler<
    typeof deleteEnrollmentRequestsRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'subject_requests:reject',
            'Forbidden. Missing subject_requests:reject permission.',
        );

        const { request_ids } = c.req.valid('json');
        const data = await EnrollmentService.deleteEnrollmentRequests(
            c.get('dbClient'),
            request_ids,
        );

        return c.json(
            {
                message: 'Enrollment requests deleted successfully',
                data: data as any,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Delete enrollment requests error:');
    }
};
