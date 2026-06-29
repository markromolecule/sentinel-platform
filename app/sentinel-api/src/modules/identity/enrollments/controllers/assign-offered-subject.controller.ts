import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { assignOfferedSubjectSchema } from '../enrollments.dto';
import { EnrollmentService } from '../enrollments.service';

export const assignOfferedSubjectRoute = createRoute({
    method: 'post',
    path: '/assign',
    tags: ['Subjects', 'Admin'],
    summary: 'Directly assign offered subject to an instructor',
    description:
        'Allows an administrator or support user to directly assign an offered subject to an instructor, pre-approving the enrollment request and creating the corresponding classroom role.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: assignOfferedSubjectSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: assignOfferedSubjectSchema.response,
                },
            },
            description: 'Assigned successfully',
        },
        400: { description: 'Bad Request' },
        403: { description: 'Forbidden' },
        404: { description: 'Not Found' },
        500: { description: 'Internal Server Error' },
    },
});

export const assignOfferedSubjectRouteHandler: AppRouteHandler<
    typeof assignOfferedSubjectRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'subjects:update',
            'Forbidden. Missing subjects:update permission.',
        );

        const supabaseUser = c.get('supabaseUser') as any;
        const user = c.get('user');
        const adminUserId = user?.id || supabaseUser?.id;

        if (!adminUserId) {
            return c.json({ error: 'Unauthorized. User ID not found.' }, 401 as any);
        }

        const { instructorId, subjectOfferingId } = c.req.valid('json');

        const result = await EnrollmentService.assignOfferedSubject(
            c.get('dbClient'),
            instructorId,
            subjectOfferingId,
            adminUserId,
        );

        return c.json(
            {
                message: 'Successfully assigned offered subject to instructor.',
                data: result,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Assign offered subject error:');
    }
};
