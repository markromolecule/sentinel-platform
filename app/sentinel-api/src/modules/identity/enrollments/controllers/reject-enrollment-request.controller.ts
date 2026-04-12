import { createRoute, z } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
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
        requireActivePermission(
            c,
            'subject_requests:reject',
            'Forbidden. Missing subject_requests:reject permission.',
        );

        const { request_ids } = c.req.valid('json');
        const supabaseUser = c.get('supabaseUser') as any;
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
        return respondWithRouteError(c, error, 'Reject enrollment request error:');
    }
};
