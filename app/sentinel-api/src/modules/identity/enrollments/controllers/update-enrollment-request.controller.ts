import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { updateEnrollmentRequestSchema } from '../enrollments.dto';
import { EnrollmentService } from '../enrollments.service';

export const updateEnrollmentRequestRoute = createRoute({
    method: 'put',
    path: '/requests',
    tags: ['Subjects'],
    summary: 'Update enrollment requests',
    description:
        'Rewrites an instructor enrollment request selection and re-submits the updated request set for review as pending.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: updateEnrollmentRequestSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: updateEnrollmentRequestSchema.response,
                },
            },
            description: 'Enrollment request updated successfully',
        },
        400: { description: 'Bad Request' },
        403: { description: 'Forbidden' },
        404: { description: 'Not Found' },
        409: { description: 'Conflict' },
        500: { description: 'Internal Server Error' },
    },
});

export const updateEnrollmentRequestRouteHandler: AppRouteHandler<
    typeof updateEnrollmentRequestRoute
> = async (c) => {
    try {
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;

        if (role === 'instructor') {
            requireActivePermission(
                c,
                'subject_requests:request',
                'Forbidden. Missing subject_requests:request permission.',
            );
        } else if (role === 'admin' || role === 'superadmin') {
            requireActivePermission(
                c,
                'subject_requests:approve',
                'Forbidden. Missing subject_requests:approve permission.',
            );
        } else {
            return c.json(
                {
                    error: 'Forbidden. Only admins, superadmins, or instructors can update requests.',
                },
                403 as any,
            );
        }

        const user = c.get('user');
        const userId = user?.id || supabaseUser?.id;

        if (!userId) {
            return c.json({ error: 'Unauthorized. User ID not found.' }, 401 as any);
        }

        const payload = c.req.valid('json');
        const data = await EnrollmentService.updateEnrollmentRequest(c.get('dbClient'), {
            payload,
            requesterRole: role,
            requesterUserId: userId,
            requesterInstitutionId: c.get('institutionId'),
            requesterDepartmentId: user?.user_profiles?.department_id ?? null,
            requesterCourseId: user?.user_profiles?.course_id ?? null,
        });

        return c.json(
            {
                message: 'Enrollment request updated and re-submitted for review',
                data: data as any,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Update enrollment request error:');
    }
};
