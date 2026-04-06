import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { enrollInstructorSubjectSchema } from '../enrollments.dto';
import { EnrollmentService } from '../enrollments.service';

export const enrollSubjectRoute = createRoute({
    method: 'post',
    path: '/enroll',
    tags: ['Subjects', 'Instructor'],
    summary: 'Request enrollment into an offered subject',
    description:
        'Creates instructor enrollment requests for one or more class groups under a selected subject offering.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: enrollInstructorSubjectSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: enrollInstructorSubjectSchema.response,
                },
            },
            description: 'Enrolled successfully',
        },
        400: { description: 'Bad Request' },
        403: { description: 'Forbidden' },
        500: { description: 'Internal Server Error' },
    },
});

export const enrollSubjectRouteHandler: AppRouteHandler<typeof enrollSubjectRoute> = async (c) => {
    try {
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const userId = c.get('user')?.id || supabaseUser?.id;

        if (!userId) {
            return c.json({ error: 'Unauthorized. User ID not found.' }, 401 as any);
        }

        if (role !== 'instructor') {
            return c.json(
                { error: 'Forbidden. Only instructors can request offered subjects.' },
                403 as any,
            );
        }

        const payload = c.req.valid('json');

        // Pass to an enroll service routine that handles transactions
        const result = await EnrollmentService.enrollInstructor(c.get('dbClient'), userId, payload);

        const { newRequestsCount, existingRequestsCount, existingRolesCount } = result;
        let message = '';

        if (newRequestsCount > 0) {
            message = `Successfully submitted enrollment request for ${newRequestsCount} section${newRequestsCount > 1 ? 's' : ''}.`;
        }

        if (existingRequestsCount > 0 || existingRolesCount > 0) {
            const alreadyMessage = [];
            if (existingRequestsCount > 0)
                alreadyMessage.push(`${existingRequestsCount} already pending`);
            if (existingRolesCount > 0)
                alreadyMessage.push(`${existingRolesCount} already enrolled`);

            if (message) {
                message += ` (${alreadyMessage.join(', ')})`;
            } else {
                message = `Selection ignored: ${alreadyMessage.join(' and ')}.`;
                
                // Return 409 Conflict if nothing new was added and duplicates exist
                return c.json(
                    {
                        error: message,
                        data: result,
                    },
                    409 as any,
                );
            }
        }

        return c.json(
            {
                message: message || 'Enrollment request processed.',
                data: result,
            },
            200,
        );
    } catch (error: any) {
        console.error('Enroll subject error:', error);
        return c.json({ error: error?.message || 'Internal Server Error' }, 500);
    }
};
