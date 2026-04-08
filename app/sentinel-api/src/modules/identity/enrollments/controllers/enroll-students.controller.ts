import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { enrollStudentsSchema } from '../enrollments.dto';
import { EnrollmentService } from '../enrollments.service';

export const enrollStudentsRoute = createRoute({
    method: 'post',
    path: '/enroll/students',
    tags: ['Students', 'Instructor'],
    summary: 'Enroll students into a class group',
    description:
        'Instructors can manually or bulk enroll students into their class groups after validation.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: enrollStudentsSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: enrollStudentsSchema.response,
                },
            },
            description: 'Students enrollment processed successfully',
        },
        400: { description: 'Bad Request' },
        403: { description: 'Forbidden' },
        500: { description: 'Internal Server Error' },
    },
});

export const enrollStudentsRouteHandler: AppRouteHandler<typeof enrollStudentsRoute> = async (c) => {
    try {
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const institutionId = c.get('institutionId');

        if (!institutionId) {
            return c.json({ error: 'Unauthorized. Institution ID not found.' }, 401 as any);
        }

        if (role !== 'instructor') {
            return c.json(
                { error: 'Forbidden. Only instructors can enroll students.' },
                403 as any,
            );
        }

        const payload = c.req.valid('json');

        const result = await EnrollmentService.enrollStudents(
            c.get('dbClient'),
            institutionId,
            payload,
        );

        return c.json(
            {
                message: `Processed ${payload.studentNumbers.length} student(s): ${result.enrolledCount} enrolled, ${result.failedCount} failed.`,
                data: result,
            },
            200,
        );
    } catch (error: any) {
        console.error('Enroll students error:', error);
        return c.json({ error: error?.message || 'Internal Server Error' }, 500);
    }
};
