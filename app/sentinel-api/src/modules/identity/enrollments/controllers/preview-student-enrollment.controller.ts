import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { previewStudentEnrollmentSchema } from '../enrollments.dto';
import { EnrollmentService } from '../enrollments.service';

export const previewStudentEnrollmentRoute = createRoute({
    method: 'post',
    path: '/enroll/students/preview',
    tags: ['Students', 'Instructor'],
    summary: 'Preview student enrollment claim status',
    description:
        'Checks whether uploaded student numbers are claimed, unclaimed, or missing from the whitelist before enrollment.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: previewStudentEnrollmentSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: previewStudentEnrollmentSchema.response,
                },
            },
            description: 'Student preview generated successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        500: { description: 'Internal Server Error' },
    },
});

export const previewStudentEnrollmentRouteHandler: AppRouteHandler<
    typeof previewStudentEnrollmentRoute
> = async (c) => {
    try {
        const institutionId = c.get('institutionId');
        const user = c.get('user');
        const userRole = c.get('role');

        if (!institutionId) {
            return c.json({ error: 'Unauthorized. Institution ID not found.' }, 401 as any);
        }

        requireActivePermission(
            c,
            'classrooms:preview_student_enrollment',
            'Forbidden. Missing classrooms:preview_student_enrollment permission.',
        );

        const payload = c.req.valid('json');
        const results = await EnrollmentService.previewStudentEnrollment(
            c.get('dbClient'),
            institutionId,
            user.id,
            userRole,
            payload.studentNumbers,
            payload.classGroupId,
        );

        return c.json(
            {
                message: 'Student preview generated successfully.',
                data: {
                    results,
                },
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Preview student enrollment error:');
    }
};
