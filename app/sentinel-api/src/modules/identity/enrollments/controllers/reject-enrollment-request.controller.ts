import { createRoute, z } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { rejectEnrollmentRequestSchema } from '../enrollments.dto';
import { EnrollmentService } from '../enrollments.service';

export const rejectEnrollmentRequestRoute = createRoute({
    method: 'post',
    path: '/requests/reject',
    tags: ['Subjects', 'Admin'],
    summary: 'Reject enrollment requests',
    description: 'Rejects one or more instructor subject enrollment requests.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: rejectEnrollmentRequestSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: rejectEnrollmentRequestSchema.response,
                },
            },
            description: 'Requests rejected successfully',
        },
        403: { description: 'Forbidden' },
        404: { description: 'Not Found' },
        500: { description: 'Internal Server Error' },
    },
});

export const rejectEnrollmentRequestRouteHandler: AppRouteHandler<
    typeof rejectEnrollmentRequestRoute
> = async (c) => {
    try {
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;

        if (role !== 'admin' && role !== 'superadmin') {
            return c.json({ error: 'Forbidden. Admin access required.' }, 403 as any);
        }

        const { request_ids } = c.req.valid('json');
        const userId = c.get('user')?.id || supabaseUser?.id;

        const data = await EnrollmentService.rejectEnrollmentRequest(
            c.get('dbClient'),
            request_ids,
            userId,
        );

        return c.json(
            {
                message: 'Enrollment requests rejected successfully',
                data: data as any,
            },
            200,
        );
    } catch (error: any) {
        console.error('Reject enrollment request error:', error);
        return c.json({ error: error?.message || 'Internal Server Error' }, 500);
    }
};
