import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { unapproveEnrollmentRequestSchema } from '../enrollments.dto';
import { EnrollmentService } from '../enrollments.service';

export const unapproveEnrollmentRequestRoute = createRoute({
    method: 'post',
    path: '/requests/unapprove',
    tags: ['Subjects', 'Admin'],
    summary: 'Unapprove enrollment requests',
    description:
        'Moves one or more approved instructor subject enrollment requests back to pending and removes the instructor class assignment.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: unapproveEnrollmentRequestSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: unapproveEnrollmentRequestSchema.response,
                },
            },
            description: 'Requests unapproved successfully',
        },
        403: { description: 'Forbidden' },
        404: { description: 'Not Found' },
        500: { description: 'Internal Server Error' },
    },
});

export const unapproveEnrollmentRequestRouteHandler: AppRouteHandler<
    typeof unapproveEnrollmentRequestRoute
> = async (c) => {
    try {
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;

        if (role !== 'admin' && role !== 'superadmin') {
            return c.json({ error: 'Forbidden. Admin access required.' }, 403 as any);
        }

        const { request_ids } = c.req.valid('json');
        const data = await EnrollmentService.unapproveEnrollmentRequest(
            c.get('dbClient'),
            request_ids,
        );

        return c.json(
            {
                message: 'Enrollment requests unapproved successfully',
                data: data as any,
            },
            200,
        );
    } catch (error: any) {
        console.error('Unapprove enrollment request error:', error);
        return c.json({ error: error?.message || 'Internal Server Error' }, 500);
    }
};
