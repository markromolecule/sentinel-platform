import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { getEnrolledSubjectsSchema } from '../enrollments.dto';
import { EnrollmentService } from '../enrollments.service';

export const getEnrolledSubjectsRoute = createRoute({
    method: 'get',
    path: '/enrolled',
    tags: ['Subjects', 'Instructor'],
    summary: 'Get enrolled offered subjects for the instructor',
    description:
        'Retrieves all approved offered-subject enrollments for the instructor across class groups.',
    request: {
        query: getEnrolledSubjectsSchema.query,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getEnrolledSubjectsSchema.response,
                },
            },
            description: 'Enrolled subjects retrieved successfully',
        },
        403: { description: 'Forbidden' },
        500: { description: 'Internal Server Error' },
    },
});

export const getEnrolledSubjectsRouteHandler: AppRouteHandler<
    typeof getEnrolledSubjectsRoute
> = async (c) => {
    try {
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const userId = c.get('user')?.id;

        if (role !== 'instructor') {
            return c.json(
                { error: 'Forbidden. Only instructors can get their offered subjects.' },
                403 as any,
            );
        }

        const { search } = c.req.valid('query');

        const enrolledData = await EnrollmentService.getEnrolledSubjects(
            c.get('dbClient'),
            userId,
            search,
        );

        return c.json(
            {
                message: 'Enrolled subjects retrieved successfully',
                data: enrolledData,
            },
            200,
        );
    } catch (error: any) {
        console.error('Get enrolled subjects error:', error);
        return c.json({ error: error?.message || 'Internal Server Error' }, 500);
    }
};
