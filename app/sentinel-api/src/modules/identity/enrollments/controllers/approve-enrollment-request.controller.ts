import { createRoute, z } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
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
        requireActivePermission(
            c,
            'subject_requests:approve',
            'Forbidden. Missing subject_requests:approve permission.',
        );
        const supabaseUser = c.get('supabaseUser') as any;
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
        return respondWithRouteError(c, error, 'Approve enrollment request error:');
    }
};
