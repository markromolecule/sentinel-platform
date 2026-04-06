import { createRoute, z } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { approveEnrollmentRequestSchema } from '../enrollments.dto';
import { EnrollmentService } from '../enrollments.service';

export const approveEnrollmentRequestRoute = createRoute({
    method: 'post',
    path: '/requests/approve',
    tags: ['Subjects', 'Admin'],
    summary: 'Approve enrollment requests',
    description:
        'Approves one or more instructor subject enrollment requests and maps them to class_roles.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: approveEnrollmentRequestSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: approveEnrollmentRequestSchema.response,
                },
            },
            description: 'Requests approved successfully',
        },
        403: { description: 'Forbidden' },
        404: { description: 'Not Found' },
        500: { description: 'Internal Server Error' },
    },
});

export const approveEnrollmentRequestRouteHandler: AppRouteHandler<
    typeof approveEnrollmentRequestRoute
> = async (c) => {
    try {
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;

        if (role !== 'admin' && role !== 'superadmin') {
            return c.json({ error: 'Forbidden. Admin access required.' }, 403 as any);
        }

        const { request_ids } = c.req.valid('json');
        const userId = c.get('user')?.id || supabaseUser?.id;

        const data = await EnrollmentService.approveEnrollmentRequest(
            c.get('dbClient'),
            request_ids,
            userId,
        );

        return c.json(
            {
                message: 'Enrollment requests approved successfully',
                data: data as any,
            },
            200,
        );
    } catch (error: any) {
        console.error('Approve enrollment request error:', error);
        return c.json({ error: error?.message || 'Internal Server Error' }, 500);
    }
};
