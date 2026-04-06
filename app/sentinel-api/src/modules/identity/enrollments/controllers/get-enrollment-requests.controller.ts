import { createRoute, z } from '@hono/zod-openapi';
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
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const userId = c.get('user')?.id;

        if (role !== 'admin' && role !== 'superadmin' && role !== 'instructor') {
            return c.json({ error: 'Forbidden. Admin or Instructor access required.' }, 403 as any);
        }

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
        console.error('Get enrollment requests error:', error);
        return c.json({ error: error?.message || 'Internal Server Error' }, 500);
    }
};
