import { createRoute, z } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { getEnrollmentRequestsSchema } from '../enrollments.dto';
import { EnrollmentService } from '../enrollments.service';

export const getEnrollmentRequestsRoute = createRoute({
    method: 'get',
    path: '/requests',
    tags: ['Subjects', 'Admin'],
    summary: 'Get all pending enrollment requests',
    description:
        'Fetches instructor offered-subject enrollment requests. Restricted to admin, superadmin, or the requesting instructor.',
    request: {
        query: getEnrollmentRequestsSchema.query,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getEnrollmentRequestsSchema.response,
                },
            },
            description: 'Requests fetched successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        500: { description: 'Internal Server Error' },
    },
});

export const getEnrollmentRequestsRouteHandler: AppRouteHandler<
    typeof getEnrollmentRequestsRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'subject_requests:view',
            'Forbidden. Missing subject_requests:view permission.',
        );
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const userId = c.get('user')?.id;

        const { status } = c.req.valid('query');

        // If instructor, only show their own requests
        const targetUserId = role === 'instructor' ? userId : undefined;

        const data = await EnrollmentService.getEnrollmentRequests(
            c.get('dbClient'),
            status,
            targetUserId,
        );

        return c.json(
            {
                message: 'Enrollment requests fetched successfully',
                data: data as any,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Get enrollment requests error:');
    }
};
